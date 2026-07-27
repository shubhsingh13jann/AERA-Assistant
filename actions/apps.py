"""
Opening desktop applications - cache-aside resolution:
  1. config.APPS      - manual override, always wins if present
  2. storage app_cache - previously learned, instant
  3. actions.discovery - live Start Menu search, only on a miss;
     result gets cached so it's instant next time
"""

import os
import subprocess
import logging

from config import APPS
from storage.db import get_cached_app_path, cache_app_path
from actions.discovery import find_app_path

log = logging.getLogger("signal")


def open_app(name: str) -> str:
    name = name.lower().strip()

    path = APPS.get(name)

    if not path:
        path = get_cached_app_path(name)
        if path:
            log.info("resolved %r from cache: %s", name, path)

    if not path:
        path = find_app_path(name)
        if path:
            cache_app_path(name, path)
            log.info("learned new app: %s -> %s", name, path)

    if path and os.path.exists(path):
        subprocess.Popen(path)
        return f"command accepted - opening {name}."

    return f"I couldn't find {name} in config, cache, or your Start Menu."