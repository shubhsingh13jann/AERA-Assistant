"""
Declarative intent table. Add a new command by adding one Intent
entry here - no need to touch the router or the main loop.

Order matters: specific patterns must come before their catch-all
fallbacks (e.g. "search X on google" before the bare "search X").
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
    Intent("open_app", re.compile(r"open (whatsapp|chrome|vscode)"),
           lambda m: open_app(m.group(1))),
    Intent("snap_left", re.compile(r"(shift|snap|move).*\bleft\b"),
           lambda m: snap_window("left")),
    Intent("snap_right", re.compile(r"(shift|snap|move).*\bright\b"),
           lambda m: snap_window("right")),
    Intent("amazon_search", re.compile(r"open amazon and search (.+)"),
           lambda m: search_amazon(m.group(1))),
    Intent("google_search_explicit", re.compile(r"search (.+?) on google"),
           lambda m: search_google(m.group(1))),
    Intent("google_search_fallback", re.compile(r"search (.+)"),
           lambda m: search_google(m.group(1))),
]
