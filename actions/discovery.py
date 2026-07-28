"""
App discovery - checks the system PATH first (covers Windows built-ins
like notepad, calc, mspaint - these often have no Start Menu shortcut
at all), then falls back to searching Start Menu .lnk shortcuts.

pip install pywin32
"""

import os
import glob
import shutil
import logging

import win32com.client

log = logging.getLogger("signal")

SEARCH_DIRS = [
    os.path.expandvars(r"%ProgramData%\Microsoft\Windows\Start Menu\Programs"),
    os.path.expandvars(r"%AppData%\Microsoft\Windows\Start Menu\Programs"),
]


def find_app_path(name: str):
    name = name.lower().strip()

    which_result = shutil.which(name)
    if which_result:
        log.info("discovery matched %r via system PATH: %s", name, which_result)
        return which_result

    shell = win32com.client.Dispatch("WScript.Shell")
    for base_dir in SEARCH_DIRS:
        if not os.path.isdir(base_dir):
            continue
        for lnk_path in glob.glob(os.path.join(base_dir, "**", "*.lnk"), recursive=True):
            shortcut_name = os.path.splitext(os.path.basename(lnk_path))[0].lower()
            if name in shortcut_name or shortcut_name in name:
                try:
                    shortcut = shell.CreateShortcut(lnk_path)
                    target = shortcut.Targetpath
                    if target and os.path.exists(target):
                        log.info("discovery matched %r -> %s (via %s)", name, target, lnk_path)
                        return target
                except Exception:
                    log.exception("failed to resolve shortcut %s", lnk_path)

    log.info("discovery found no match for %r", name)
    return None