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


def search_youtube(query: str) -> str:
    webbrowser.open(f"https://www.youtube.com/results?search_query={query.strip().replace(' ', '+')}")
    return "command accepted - searching youtube."


def search_spotify(query: str) -> str:
    webbrowser.open(f"https://open.spotify.com/search/{query.strip().replace(' ', '%20')}")
    return "command accepted - searching spotify."