"""
Browser search actions. Launches Chrome directly with the URL as a
command-line argument - the same mechanism actions.apps.open_app
already uses successfully - instead of webbrowser.open(), which
depends on whatever Windows has set as the default browser and can
behave inconsistently from a background thread.
"""

import subprocess

from config import APPS


def _open_url_in_chrome(url: str) -> None:
    chrome_path = APPS.get("chrome")
    if chrome_path:
        subprocess.Popen([chrome_path, url])
    else:
        import webbrowser
        webbrowser.open(url)  # fallback only if chrome path isn't configured


def search_google(query: str) -> str:
    url = f"https://www.google.com/search?q={query.strip().replace(' ', '+')}"
    _open_url_in_chrome(url)
    return "command accepted - searching google."


def search_amazon(query: str) -> str:
    url = f"https://www.amazon.in/s?k={query.strip().replace(' ', '+')}"
    _open_url_in_chrome(url)
    return "command accepted - opening amazon and searching."


def search_youtube(query: str) -> str:
    url = f"https://www.youtube.com/results?search_query={query.strip().replace(' ', '+')}"
    _open_url_in_chrome(url)
    return "command accepted - searching youtube."


def play_youtube(query: str) -> str:
    from actions.apps import open_app
    open_app("youtube")
    url = f"https://www.youtube.com/results?search_query={query.strip().replace(' ', '+')}"
    _open_url_in_chrome(url)
    return f"command accepted - opening youtube app and searching for {query}."


def search_spotify(query: str) -> str:
    url = f"https://open.spotify.com/search/{query.strip().replace(' ', '%20')}"
    _open_url_in_chrome(url)
    return "command accepted - searching spotify."


def play_spotify(query: str) -> str:
    from actions.apps import open_app
    open_app("spotify")
    url = f"https://open.spotify.com/search/{query.strip().replace(' ', '%20')}"
    _open_url_in_chrome(url)
    return f"command accepted - opening spotify app and searching for {query}."