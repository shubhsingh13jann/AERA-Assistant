"""
Closing running applications by name, using psutil to find and
terminate matching processes. Works reliably for regular .exe apps
(chrome, notepad, vscode); UWP/Store apps (WhatsApp, Netflix, Claude)
may not always match cleanly since Windows often runs them under
internal process names that don't match their display name - this is
a known limitation, not silently pretended to work. Add entries to
PROCESS_NAME_OVERRIDES below as you hit mismatches.
"""

import os
import logging

import psutil

from config import APPS, APP_ALIASES
from storage.db import get_cached_app_path

log = logging.getLogger("signal")

PROCESS_NAME_OVERRIDES = {
    "vscode": "code",
    "visual studio code": "code",
    "youtube": "chrome",
    "spotify": "spotify",
}


def _expected_process_name(name: str) -> str:
    if name in PROCESS_NAME_OVERRIDES:
        return PROCESS_NAME_OVERRIDES[name]

    path = APPS.get(name) or get_cached_app_path(name)
    if path and not path.startswith("shell:"):
        return os.path.splitext(os.path.basename(path))[0].lower()

    return name


def close_app(name: str) -> str:
    name = name.lower().strip()
    normalized_name = " ".join(name.replace("-", " ").split())
    name = APP_ALIASES.get(normalized_name, normalized_name)

    expected = _expected_process_name(name)
    closed_any = False

    for proc in psutil.process_iter(["pid", "name"]):
        proc_name = (proc.info.get("name") or "").lower()
        if not proc_name:
            continue
        if expected in proc_name or proc_name.replace(".exe", "") == expected:
            try:
                proc.terminate()
                closed_any = True
                log.info("closed process %s (pid %d) for %r", proc_name, proc.info["pid"], name)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                log.exception("failed to close process %s", proc_name)

    if closed_any:
        return f"command accepted - closing {name}."
    return f"I couldn't find {name} running."