"""
Automated WhatsApp Messaging Engine for Signal / JARVIS.
Dispatches messages directly via Windows WhatsApp Desktop protocol (whatsapp://)
or automated UI desktop search and keystroke delivery, with contact resolution
and fallback to WhatsApp Web.
"""

import ctypes
import logging
import os
import re
import threading
import time
import urllib.parse
import webbrowser

from config import CONTACTS, APPS

log = logging.getLogger("signal")


def _clean_phone(phone_str: str) -> str:
    """Strip spaces, dashes, and ensure valid international numeric format."""
    cleaned = re.sub(r"[^\d+]", "", phone_str)
    # If standard 10-digit number without country code, default to 91 (India) or keep as-is
    if cleaned.startswith("+"):
        return cleaned.lstrip("+")
    if len(cleaned) == 10:
        return f"91{cleaned}"
    return cleaned


def parse_whatsapp_command(text: str) -> tuple[str, str] | None:
    """
    Robustly parses WhatsApp voice and text commands into (recipient, message).
    Handles multi-word names (e.g. 'Hira Dadu', 'Uncle Bob'), commands with or
    without 'saying'/'that', colons, and shorthand formats.
    """
    t = text.strip()
    t = re.sub(r"\bwhats\s+app\b", "whatsapp", t, flags=re.I)

    # 1. Matches with explicit separator: saying / that / with message / telling / asking / :
    m1 = re.search(
        r"(?:(?:open\s+whatsapp\s+and\s+)?send\s+(?:a\s+)?(?:message\s+(?:on|via)\s+)?whatsapp\s+(?:message\s+)?to|open\s+whatsapp\s+and\s+send\s+(?:a\s+)?(?:message\s+)?to|whatsapp)\s+([^,:]+?)\s*(?::|saying|that|with message|telling them|asking)\s+(.+)",
        t,
        re.I,
    )
    if m1:
        return m1.group(1).strip(), m1.group(2).strip()

    # 2. Matches without explicit separator:
    m2 = re.search(
        r"(?:(?:open\s+whatsapp\s+and\s+)?send\s+(?:a\s+)?(?:message\s+(?:on|via)\s+)?whatsapp\s+(?:message\s+)?to|open\s+whatsapp\s+and\s+send\s+(?:a\s+)?(?:message\s+)?to)\s+(.+)",
        t,
        re.I,
    )
    if m2:
        rest = m2.group(1).strip()
        # Check known contacts first (including multi-word ones from CONTACTS)
        rest_lower = rest.lower()
        for cname in CONTACTS:
            if cname and rest_lower.startswith(cname.lower()):
                rem = rest[len(cname):].strip()
                rem = re.sub(r"^(?:saying|that|with message|:\s*)\s*", "", rem, flags=re.I).strip()
                return cname, rem or "Hello from JARVIS"

        # Check phone number
        m_phone = re.match(r"^(\+?\d{7,15})\s+(.+)", rest)
        if m_phone:
            return m_phone.group(1).strip(), m_phone.group(2).strip()

        # Split on first word
        parts = rest.split(maxsplit=1)
        if len(parts) == 2:
            return parts[0].strip(), parts[1].strip()
        elif len(parts) == 1:
            return parts[0].strip(), "Hello from JARVIS"

    # 3. Direct shorthand: 'whatsapp to <contact> <msg>' or 'whatsapp <contact> <msg>'
    m3 = re.search(r"^whatsapp\s+(?:to\s+)?([a-zA-Z0-9_+]+)\s+(.+)$", t, re.I)
    if m3:
        return m3.group(1).strip(), m3.group(2).strip()

    return None


def activate_whatsapp() -> bool:
    """Ensures WhatsApp Desktop is launched, restored from tray/minimized, and brought to foreground."""
    try:
        os.startfile("whatsapp://")
    except Exception as e:
        log.warning("Could not launch whatsapp:// URI: %s", e)

    time.sleep(0.6)

    found_hwnd = None

    def cb(hwnd, _):
        nonlocal found_hwnd
        try:
            import win32gui
            if win32gui.IsWindowVisible(hwnd):
                t = win32gui.GetWindowText(hwnd)
                if t and "whatsapp" in t.lower() and "gdi+" not in t.lower():
                    found_hwnd = hwnd
        except Exception:
            pass

    try:
        import win32gui
        win32gui.EnumWindows(cb, None)
    except Exception:
        pass

    if not found_hwnd:
        try:
            import win32gui
            import win32service
            import win32con
            hdesk = win32service.OpenDesktop("Default", 0, False, win32con.GENERIC_ALL)
            win32gui.EnumDesktopWindows(hdesk, cb, None)
        except Exception:
            pass

    if found_hwnd:
        try:
            import win32gui
            import win32con
            import win32process
            import win32api
            user32 = ctypes.windll.user32
            fore_hwnd = win32gui.GetForegroundWindow()
            cur_tid = win32api.GetCurrentThreadId()
            fore_tid, _ = win32process.GetWindowThreadProcessId(fore_hwnd)
            user32.AttachThreadInput(fore_tid, cur_tid, True)
            try:
                if win32gui.IsIconic(found_hwnd):
                    win32gui.ShowWindow(found_hwnd, win32con.SW_RESTORE)
                else:
                    win32gui.ShowWindow(found_hwnd, win32con.SW_SHOW)
                win32gui.SetForegroundWindow(found_hwnd)
                win32gui.BringWindowToTop(found_hwnd)
            finally:
                user32.AttachThreadInput(fore_tid, cur_tid, False)
            return True
        except Exception as e:
            log.warning("Error forcing foreground on WhatsApp window: %s", e)

    # Fallback using pygetwindow
    try:
        import pygetwindow as gw
        for w in gw.getWindowsWithTitle("WhatsApp"):
            if w.isMinimized:
                w.restore()
            w.activate()
            return True
    except Exception:
        pass

    return False


def send_whatsapp(recipient: str, message: str) -> dict:
    """
    Automates sending a WhatsApp message to a named contact or phone number.
    Returns speech response and structured card for the HUD.
    """
    recip_clean = (recipient or "").strip()
    msg_clean = (message or "").strip()

    if not msg_clean:
        msg_clean = "Hello from JARVIS"

    # 1. Resolve contact from config.CONTACTS
    phone = None
    target_label = recip_clean.title() if recip_clean else "Recipient"

    recip_lower = recip_clean.lower()
    if recip_lower in CONTACTS and CONTACTS[recip_lower]:
        phone = _clean_phone(CONTACTS[recip_lower])
        target_label = recip_clean.title()
    elif re.search(r"\d{7,15}", recip_clean):
        phone = _clean_phone(recip_clean)
        target_label = phone

    encoded_msg = urllib.parse.quote(msg_clean)

    # 2. Dispatch mechanism
    if phone:
        uri = f"whatsapp://send?phone={phone}&text={encoded_msg}"
        web_url = f"https://web.whatsapp.com/send?phone={phone}&text={encoded_msg}"
    else:
        uri = "whatsapp://"
        web_url = "https://web.whatsapp.com"

    def dispatch_worker():
        try:
            import pyautogui
            import pyperclip

            if phone:
                # Path A: Phone number is known - direct protocol send
                os.startfile(uri)
                log.info("Dispatched WhatsApp URI for %s: %s", target_label, uri)
                time.sleep(1.8)
                activate_whatsapp()
                time.sleep(0.3)
                pyautogui.press("enter")
                log.info("Pressed enter to send WhatsApp to %s", target_label)
            else:
                # Path B: Contact name only - UI search & keystroke automation
                log.info("Executing desktop UI contact search and send for %s", recip_clean)
                activate_whatsapp()
                time.sleep(0.8)

                # Clear any existing search or popup
                pyautogui.press("escape")
                time.sleep(0.1)
                pyautogui.press("escape")
                time.sleep(0.2)

                # Open search box (Ctrl+F)
                pyautogui.hotkey("ctrl", "f")
                time.sleep(0.3)

                # Type contact name via clipboard
                pyperclip.copy(recip_clean)
                pyautogui.hotkey("ctrl", "v")
                time.sleep(0.9)  # Allow WhatsApp to filter contacts

                # Select first matching contact
                pyautogui.press("down")
                time.sleep(0.2)
                pyautogui.press("enter")  # Opens chat and focuses message composer
                time.sleep(0.6)

                # Paste message into composer and send
                pyperclip.copy(msg_clean)
                pyautogui.hotkey("ctrl", "v")
                time.sleep(0.3)
                pyautogui.press("enter")  # Send message
                log.info("Sent WhatsApp message to %s via desktop UI automation", recip_clean)

        except Exception as e:
            log.warning("WhatsApp desktop automation failed, falling back to Web: %s", e)
            try:
                webbrowser.open(web_url)
            except Exception:
                pass

    threading.Thread(target=dispatch_worker, daemon=True).start()

    speech = f"Sending WhatsApp message to {target_label} saying: {msg_clean}, Sir."
    text_disp = f"WhatsApp to {target_label}: \"{msg_clean}\""

    return {
        "speech": speech,
        "text": text_disp,
        "card": {
            "type": "whatsapp",
            "data": {
                "recipient": target_label,
                "phone": f"+{phone}" if phone else "WhatsApp Contact",
                "message": msg_clean,
                "status": "SENT",
                "url": web_url,
                "time": "Just Now",
            },
        },
    }
