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
from actions.system import (
    volume_up, volume_down, set_volume, toggle_mute, play_pause, hold_pause,
    next_track, previous_track, lock_screen,
)

@dataclass
class Intent:
    name: str
    pattern: "re.Pattern"
    handler: Callable[["re.Match"], str]


INTENTS = [
    Intent("amazon_search_open", re.compile(r"open amazon and search (.+)"),
           lambda m: search_amazon(m.group(1))),
    Intent("amazon_search_on", re.compile(r"search (.+?) on amazon"),
           lambda m: search_amazon(m.group(1))),

    Intent("youtube_search_on", re.compile(r"search (.+?) on youtube"),
           lambda m: search_youtube(m.group(1))),
    Intent("youtube_play_on", re.compile(r"play (.+?) on youtube"),
           lambda m: play_youtube(m.group(1))),

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
