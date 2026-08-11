"""
Window management. Targets a specific window by title using
pygetwindow when an app name is given, instead of relying on
pyautogui's win+direction hotkey (which only ever affects whatever
window happens to be focused, regardless of what you actually asked
for). Falls back to the hotkey behavior only when no app name is
given - e.g. plain "snap left" with nothing else specified.
"""

import ctypes
import logging

import pyautogui
import pygetwindow as gw

log = logging.getLogger("signal")

NO_APP_WORDS = {"", "it", "this", "that", "window", "the window", "this window"}


def _find_window(app_name: str):
    app_name = app_name.lower().strip()
    matches = [w for w in gw.getAllWindows() if w.title and app_name in w.title.lower()]
    return matches[0] if matches else None


def snap_window(direction: str, app_name: str = "") -> str:
    app_name = (app_name or "").lower().strip()

    if app_name in NO_APP_WORDS:
        # No specific app named - fall back to the original behavior,
        # snapping whatever's currently focused.
        pyautogui.hotkey("win", direction)
        return f"command accepted - window snapped {direction}."

    window = _find_window(app_name)
    if not window:
        return f"I couldn't find a window for {app_name} to snap."

    try:
        if window.isMinimized:
            window.restore()
        window.activate()

        screen_w = ctypes.windll.user32.GetSystemMetrics(0)
        screen_h = ctypes.windll.user32.GetSystemMetrics(1)
        half_w = screen_w // 2

        x = 0 if direction == "left" else half_w
        window.moveTo(x, 0)
        window.resizeTo(half_w, screen_h)
        return f"command accepted - snapped {app_name} {direction}."
    except Exception:
        log.exception("failed to snap window for %s", app_name)
        return f"found {app_name} but couldn't snap it."