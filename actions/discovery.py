"""
App discovery - checks the system PATH first (covers Windows built-ins
like notepad, calc, mspaint), then Start Menu shortcuts and Windows
Store/browser-PWA App IDs.

pip install pywin32
"""

import os
import glob
import json
import shutil
import logging
import subprocess

import win32com.client

log = logging.getLogger("signal")

SEARCH_DIRS = [
    os.path.expandvars(r"%ProgramData%\Microsoft\Windows\Start Menu\Programs"),
    os.path.expandvars(r"%AppData%\Microsoft\Windows\Start Menu\Programs"),
]


def find_store_app(name: str):
    """Find a Microsoft Store app or installed browser PWA by Start App ID."""
    try:
        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                "Get-StartApps | Select-Object Name,AppID | ConvertTo-Json -Compress",
            ],
            capture_output=True,
            text=True,
            check=True,
            timeout=15,
        )
        apps = json.loads(result.stdout)
    except (subprocess.SubprocessError, json.JSONDecodeError) as error:
        log.warning("could not query Windows Start apps: %s", error)
        return None

    if isinstance(apps, dict):
        apps = [apps]

    requested_name = name.lower().strip()
    for app in apps:
        app_name = app["Name"].lower().strip()
        if app_name == requested_name:
            launcher = rf"shell:AppsFolder\{app['AppID']}"
            log.info("discovery matched Store app %r -> %s", name, launcher)
            return launcher

    return None


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

    store_launcher = find_store_app(name)
    if store_launcher:
        return store_launcher

    log.info("discovery found no match for %r", name)
    return None
