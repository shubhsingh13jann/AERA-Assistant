"""
Window management.

TODO: swap pyautogui's hotkey for pygetwindow so this targets a named
app window instead of whatever happens to be focused.
pip install pygetwindow
"""

import pyautogui


def snap_window(direction: str) -> str:
    pyautogui.hotkey("win", direction)
    return f"command accepted - window snapped {direction}."
