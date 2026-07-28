"""
Declarative intent table. Add a new command by adding one Intent
entry here - no need to touch the router or the main loop.

Order matters, and so does anchoring: open_app is anchored with ^...$
so it only matches when the entire command is just "open <app>" -
nothing after it - which stops it from swallowing longer sentences
like "open chrome and search for X".
"""

import re
from dataclasses import dataclass
from typing import Callable

from actions.apps import open_app
from actions.windows import snap_window
from actions.web import search_google, search_amazon


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
    Intent("google_search_explicit", re.compile(r"search (.+?) on google"),
           lambda m: search_google(m.group(1))),
    Intent("google_search_fallback", re.compile(r"search (.+)"),
           lambda m: search_google(m.group(1))),

    # Now matches ANY single-word app name, not just whatsapp/chrome/vscode -
    # open_app's own cache-aside logic figures out the rest.
    Intent("open_app", re.compile(r"^open ([a-z0-9]+)$"),
           lambda m: open_app(m.group(1))),

    Intent("snap_left", re.compile(r"(shift|snap|move).*\bleft\b"),
           lambda m: snap_window("left")),
    Intent("snap_right", re.compile(r"(shift|snap|move).*\bright\b"),
           lambda m: snap_window("right")),
]