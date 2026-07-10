"""
Browser search actions. Playwright helpers for anything beyond a
simple URL open (WhatsApp Web automation, structured page
interaction) belong in this module too.
"""

import webbrowser


def search_google(query: str) -> str:
    webbrowser.open(f"https://www.google.com/search?q={query.strip().replace(' ', '+')}")
    return "command accepted - searching google."


def search_amazon(query: str) -> str:
    webbrowser.open(f"https://www.amazon.in/s?k={query.strip().replace(' ', '+')}")
    return "command accepted - opening amazon and searching."
