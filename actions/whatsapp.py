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


def get_whatsapp_hwnd():
    """Finds the WhatsApp Desktop window handle if it exists."""
    found_hwnds = []
    def cb(h, _):
        try:
            import win32gui
            t = win32gui.GetWindowText(h)
            if "whatsapp" in t.lower() and "gdi+" not in t.lower():
                found_hwnds.append(h)
        except Exception:
            pass
    try:
        import win32gui, win32service, win32con
        hdesk = win32service.OpenDesktop("Default", 0, False, win32con.GENERIC_ALL)
        win32gui.EnumDesktopWindows(hdesk, cb, None)
    except Exception:
        try:
            import win32gui
            win32gui.EnumWindows(cb, None)
        except Exception:
            pass
    return found_hwnds[0] if found_hwnds else None


def activate_whatsapp() -> bool:
    """Brings WhatsApp to foreground. Only launches whatsapp:// if WhatsApp is not running."""
    hwnd = get_whatsapp_hwnd()
    if not hwnd:
        try:
            os.startfile("whatsapp://")
            time.sleep(1.5)
            hwnd = get_whatsapp_hwnd()
        except Exception as e:
            log.warning("Could not launch whatsapp://: %s", e)

    if hwnd:
        try:
            import win32gui, win32process, win32api, win32con
            user32 = ctypes.windll.user32
            fore_hwnd = win32gui.GetForegroundWindow()
            cur_tid = win32api.GetCurrentThreadId()
            fore_tid, _ = win32process.GetWindowThreadProcessId(fore_hwnd)
            user32.AttachThreadInput(fore_tid, cur_tid, True)
            try:
                if win32gui.IsIconic(hwnd):
                    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                else:
                    win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                win32gui.SetForegroundWindow(hwnd)
                win32gui.BringWindowToTop(hwnd)
            finally:
                user32.AttachThreadInput(fore_tid, cur_tid, False)
            return True
        except Exception as e:
            log.warning("Error focusing WhatsApp window: %s", e)

    return False


def _get_active_chat_recipient() -> str | None:
    """Inspects WhatsApp UI Automation tree to identify the active chat composer."""
    try:
        import comtypes.client
        mod = comtypes.client.GetModule("UIAutomationCore.dll")
        uia = comtypes.client.CreateObject(mod.CUIAutomation)

        hwnd = get_whatsapp_hwnd()
        if not hwnd:
            return None

        elem = uia.ElementFromHandle(hwnd)
        # Fast query for Edit controls only (avoid scanning entire 30,000 element tree)
        cond = uia.CreatePropertyCondition(mod.UIA_ControlTypePropertyId, 50004)
        elems = elem.FindAll(mod.TreeScope_Descendants, cond)
        for i in range(elems.Length):
            el = elems.GetElement(i)
            name = el.CurrentName or ""
            if "type a message to" in name.lower():
                return name
    except Exception:
        pass
    return None


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
            import win32gui

            pyautogui.FAILSAFE = False

            if phone:
                # Path A: Phone number is known - direct protocol send
                os.startfile(uri)
                log.info("Dispatched WhatsApp URI for %s: %s", target_label, uri)

                # Wait 1.8s for WhatsApp to open the chat and populate the message box
                time.sleep(1.8)
                activate_whatsapp()
                time.sleep(0.2)

                # Press Enter to send the populated message
                pyautogui.press("enter")
                time.sleep(0.25)
                pyautogui.press("enter")
                log.info("Pressed enter to send WhatsApp to %s", target_label)

            else:
                # Path B: Contact name only - UI search & keystroke automation
                log.info("Executing fast desktop UI contact search and send for %s", recip_clean)
                activate_whatsapp()
                time.sleep(0.35)

                # Clear any existing search or popup
                pyautogui.press("escape")
                time.sleep(0.1)

                # Open search box using Ctrl+F and clear it
                pyautogui.hotkey("ctrl", "f")
                time.sleep(0.15)
                pyautogui.hotkey("ctrl", "a")
                pyautogui.press("backspace")

                # Type contact name via clipboard
                pyperclip.copy(recip_clean)
                pyautogui.hotkey("ctrl", "v")

                # Wait 1.3s for WhatsApp to filter and highlight the searched contact
                time.sleep(1.3)

                # Press Enter directly in search box (opens the top matching contact)
                pyautogui.press("enter")
                log.info("Pressed enter to open searched contact %r", recip_clean)
                time.sleep(0.4)

                # Paste message directly into the composer (which is already focused) and send
                pyperclip.copy(msg_clean)
                pyautogui.hotkey("ctrl", "v")
                time.sleep(0.2)
                pyautogui.press("enter")
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
