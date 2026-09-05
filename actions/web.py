"""
Browser search actions & Direct YouTube Autoplay Engine. Launches Chrome
directly with the URL as a command-line argument or in standalone app mode.
"""

import logging
import re
import subprocess
import urllib.parse
import urllib.request

from config import APPS

log = logging.getLogger("signal")


def _open_url_in_chrome(url: str) -> None:
    chrome_path = APPS.get("chrome")
    if chrome_path:
        subprocess.Popen([chrome_path, url])
    else:
        import webbrowser
        webbrowser.open(url)


def _open_url_as_app(url: str) -> None:
    """Single chromeless window loaded directly to the URL - no separate tab."""
    chrome_path = APPS.get("chrome")
    if chrome_path:
        subprocess.Popen([chrome_path, f"--app={url}"])
    else:
        _open_url_in_chrome(url)


def search_google(query: str) -> str:
    url = f"https://www.google.com/search?q={urllib.parse.quote(query.strip())}"
    _open_url_in_chrome(url)
    return "command accepted - searching google."


def search_amazon(query: str) -> str:
    url = f"https://www.amazon.in/s?k={urllib.parse.quote(query.strip())}"
    _open_url_in_chrome(url)
    return "command accepted - opening amazon and searching."


def search_youtube(query: str) -> str:
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query.strip())}"
    _open_url_in_chrome(url)
    return "command accepted - searching youtube."


def play_youtube(query: str) -> dict:
    """
    Scrapes the top YouTube video ID for the given query and directly
    autoplays it in Chrome app mode without user intervention.
    """
    query_clean = query.strip()
    video_id = None
    try:
        url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query_clean)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=4.0) as res:
            html = res.read().decode("utf-8", errors="ignore")
            # Extract video IDs matching standard 11-char pattern
            vids = re.findall(r"/watch\?v=([a-zA-Z0-9_-]{11})", html)
            if vids:
                video_id = vids[0]
                log.info("Found top YouTube video ID for %r: %s", query_clean, video_id)
    except Exception as e:
        log.warning("Could not scrape direct YouTube video ID: %s", e)

    if video_id:
        watch_url = f"https://www.youtube.com/watch?v={video_id}&autoplay=1"
        _open_url_as_app(watch_url)
        speech = f"Playing {query_clean} on YouTube, Sir."
        return {
            "speech": speech,
            "text": f"Playing on YouTube: {query_clean}",
            "card": {
                "type": "media",
                "data": {
                    "title": query_clean,
                    "platform": "YouTube",
                    "videoId": video_id,
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                },
            },
        }

    # Fallback to search results if video id scraping timed out
    fallback_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query_clean)}"
    _open_url_as_app(fallback_url)
    speech = f"Opening YouTube and searching for {query_clean}, Sir."
    return {
        "speech": speech,
        "text": f"Searching YouTube: {query_clean}",
        "card": {
            "type": "media",
            "data": {
                "title": query_clean,
                "platform": "YouTube",
                "url": fallback_url,
                "thumbnail": "https://www.youtube.com/img/desktop/yt_1200.png",
            },
        },
    }


def search_spotify(query: str) -> str:
    url = f"https://open.spotify.com/search/{urllib.parse.quote(query.strip())}"
    _open_url_in_chrome(url)
    return "command accepted - searching spotify."


def play_spotify(query: str) -> str:
    url = f"https://open.spotify.com/search/{urllib.parse.quote(query.strip())}"
    _open_url_as_app(url)
    return f"command accepted - opening spotify and searching {query}."