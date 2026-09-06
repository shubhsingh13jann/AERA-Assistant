"""
Declarative intent table. Add a new command by adding one Intent
entry here - no need to touch the router or the main loop.

Order matters, and so does anchoring: open_app is anchored with ^...$
so it only matches when the entire command is just "open <app>" -
nothing after it - which stops it from swallowing longer sentences
like "open chrome and search for X". System/media control intents use
the same anchoring so "play" alone doesn't swallow "play X on youtube".
"""

import re
from dataclasses import dataclass
from typing import Callable

from actions.apps import open_app
from actions.close import close_app
from actions.windows import snap_window
from actions.web import (
    search_google, search_amazon, search_youtube, search_spotify,
    play_youtube, play_spotify,
)
from actions.weather import get_weather
from actions.news import get_news
from actions.math_engine import solve_math
from actions.whatsapp import send_whatsapp
from actions.system import (
    volume_up, volume_down, set_volume, toggle_mute, play_pause, hold_pause,
    next_track, previous_track, lock_screen,
)

@dataclass
class Intent:
    name: str
    pattern: "re.Pattern"
    handler: Callable

def _handle_weather_tomorrow(match):
    m_city = re.search(r"\b(?:in|for|at)\s+([a-zA-Z\s]+)", match.string, re.I)
    if m_city:
        city = m_city.group(1).strip()
        city = re.sub(r"\b(tomorrow|today)\b", "", city, flags=re.I).strip()
        if city:
            return get_weather(f"tomorrow in {city}")
    return get_weather("tomorrow")


INTENTS = [
    Intent("amazon_search_open", re.compile(r"open amazon and search (.+)"),
           lambda m: search_amazon(m.group(1))),
    Intent("amazon_search_on", re.compile(r"search (.+?) on amazon"),
           lambda m: search_amazon(m.group(1))),

    # YouTube direct playback (both compound and direct formats)
    Intent("youtube_open_and_play", re.compile(r"open youtube and play (.+)"),
           lambda m: play_youtube(m.group(1))),
    Intent("youtube_play_on", re.compile(r"play (.+?) on youtube"),
           lambda m: play_youtube(m.group(1))),

    # Live Topic & General News (Gaming, Tech, World, Science, Business, etc.)
    Intent("news_topic", re.compile(r"\b(?!(?:the|latest|top|today|todays|current|breaking|some|any|a|read|me)\b)([a-zA-Z0-9_-]+)\s+(?:news|headlines)\b", re.I),
           lambda m: get_news(m.group(1).strip())),
    Intent("news_general", re.compile(r"\b(?:news|headlines|breaking news)\b", re.I),
           lambda m: get_news("tech")),

    # Real-time Weather, Temperature & Forecast
    Intent("weather_tomorrow", re.compile(r".*\btomorrow\b.*(?:\bweather\b|\btemperature\b|\bforecast\b|\bclimate\b|\brain\b|\bhow hot\b|\bhow cold\b|\bhot\b|\bcold\b|\bdegrees\b)|(?:\bweather\b|\btemperature\b|\bforecast\b|\bclimate\b|\brain\b|\bhow hot\b|\bhow cold\b|\bhot\b|\bcold\b|\bdegrees\b).*\btomorrow\b", re.I),
           _handle_weather_tomorrow),
    Intent("weather_explicit", re.compile(r"(?:weather|temperature|forecast|climate|rain).*\b(?:in|for|at)\s+([a-zA-Z\s]+)", re.I),
           lambda m: get_weather(m.group(1).strip())),
    Intent("weather_general", re.compile(r"\b(?:weather|temperature|temp|forecast|climate|rain|raining|how hot|how cold|hot outside|cold outside|is it hot|is it cold|degrees outside|sunny outside)\b", re.I),
           lambda m: get_weather("")),
    # Automated WhatsApp messaging
    Intent("whatsapp_send", re.compile(r"(?:send (?:a )?whatsapp (?:message )?to|whatsapp)\s+([a-zA-Z0-9_+]+)\s+(?:saying|that|with message)\s+(.+)", re.I),
           lambda m: send_whatsapp(m.group(1).strip(), m.group(2).strip())),

    # Advanced Mathematical Reasoning & Symbolic Engine
    Intent("math_calculus", re.compile(r"\b(?:derivative of|integral of|differentiate|integrate|d/dx)\s+(.+)", re.I),
           lambda m: solve_math(m.group(0))),
    Intent("math_percent", re.compile(r"\b\d+(?:\.\d+)?\s*(?:%|percent)\s+of\s+[\d,.]+", re.I),
           lambda m: solve_math(m.group(0))),
    Intent("math_solve_explicit", re.compile(r"^(?:calculate|solve|evaluate|compute)\s+(.+)$", re.I),
           lambda m: solve_math(m.group(1))),

    Intent("spotify_search_on", re.compile(r"search (.+?) on spotify"),
           lambda m: search_spotify(m.group(1))),
    Intent("spotify_play_on", re.compile(r"play (.+?) on spotify"),
           lambda m: play_spotify(m.group(1))),

    Intent("google_search_explicit", re.compile(r"search (.+?) on google"),
           lambda m: search_google(m.group(1))),
    Intent("google_search_fallback", re.compile(r"search (.+)"),
           lambda m: search_google(m.group(1))),

    # System / media control - anchored so these never swallow the
    # platform-specific "play X on youtube/spotify" intents above.
    Intent("volume_set", re.compile(r"volume (?:up |down )?(?:to )?(\d{1,3})\s*(?:%|percent)"),
           lambda m: set_volume(m.group(1))),
    Intent("volume_up", re.compile(r"^(volume up|turn (the )?volume up|increase (the )?volume|louder)$"),
           lambda m: volume_up()),
    Intent("volume_down", re.compile(r"^(volume down|turn (the )?volume down|decrease (the )?volume|quieter)$"),
           lambda m: volume_down()),
    Intent("toggle_mute", re.compile(r"^(mute|unmute|mute (the )?(volume|sound))$"),
           lambda m: toggle_mute()),
    Intent("media_play", re.compile(r"^play$"),
           lambda m: play_pause()),
    Intent("media_pause", re.compile(r"^(hold|stop)$"),
           lambda m: hold_pause()),
    Intent("next_track", re.compile(r"^(next track|next song|skip( this song)?)$"),
           lambda m: next_track()),
    Intent("previous_track", re.compile(r"^(previous track|previous song|last track)$"),
           lambda m: previous_track()),
    Intent("lock_screen", re.compile(r"^lock( (the )?(screen|computer|pc))?$"),
           lambda m: lock_screen()),

    # Match multi-word names directly so they go through deterministic app
    # discovery instead of letting the fallback LLM change the app name.
    Intent("open_app", re.compile(r"^open\s+([a-z0-9][a-z0-9 ._-]*)$"),
           lambda m: open_app(m.group(1))),

    Intent("close_app", re.compile(r"^(?:close|quit|exit)\s+([a-z0-9][a-z0-9 ._-]*)$"),
           lambda m: close_app(m.group(1))),

    Intent("snap_left", re.compile(r"(shift|snap|move).*\bleft\b"),
           lambda m: snap_window("left")),
    Intent("snap_right", re.compile(r"(shift|snap|move).*\bright\b"),
           lambda m: snap_window("right")),
]
