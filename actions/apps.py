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

from config import APPS, APP_ALIASES
from storage.db import get_cached_app_path, cache_app_path
from actions.discovery import find_app_path

log = logging.getLogger("signal")


def open_app(name: str) -> str:
    name = name.lower().strip()
    normalized_name = " ".join(name.replace("-", " ").split())
    canonical_name = APP_ALIASES.get(normalized_name, normalized_name)
    if canonical_name != name:
        log.info("normalized app request %r -> %r", name, canonical_name)
    name = canonical_name

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

    if path and path.startswith("shell:AppsFolder\\"):
        try:
            subprocess.Popen(["explorer.exe", path])
            return f"command accepted - opening {name}."
        except OSError:
            log.exception("failed to open %s", path)
            return f"found {name} but couldn't open it."

    if path and os.path.exists(path):
        try:
            subprocess.Popen(path)
            return f"command accepted - opening {name}."
        except OSError:
            log.exception("failed to open %s", path)
            return f"found {name} but couldn't open it."

    return f"I couldn't find {name} in config, cache, or your Start Menu."
