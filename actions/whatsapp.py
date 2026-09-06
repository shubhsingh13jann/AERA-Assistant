"""
Automated WhatsApp Messaging Engine for Signal / JARVIS.
Dispatches messages directly via Windows WhatsApp Desktop protocol (whatsapp://)
or WhatsApp Web, with contact resolution and automated delivery.
"""

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
    # If standard 10-digit number without country code, default to +91 (India) or keep as-is
    if cleaned.startswith("+"):
        return cleaned.lstrip("+")
    if len(cleaned) == 10:
        return f"91{cleaned}"
    return cleaned


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
        # Generic text open in WhatsApp Desktop
        uri = f"whatsapp://send?text={encoded_msg}"
        web_url = "https://web.whatsapp.com"

    def dispatch_worker():
        try:
            # Try native Windows protocol first (opens installed WhatsApp Desktop)
            os.startfile(uri)
            log.info("Dispatched WhatsApp URI: %s", uri)

            # Auto-press enter after short delay to send message if WhatsApp opens
            time.sleep(2.5)
            try:
                import pyautogui
                pyautogui.press("enter")
            except Exception:
                pass
        except Exception as e:
            log.warning("Native WhatsApp protocol failed, falling back to Web: %s", e)
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
                "status": "DISPATCHED",
                "url": web_url,
                "time": "Just Now",
            },
        },
    }
