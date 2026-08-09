"""
System and media control - volume, playback, lock screen. Uses
pyautogui to simulate the same hardware media keys a physical
keyboard would send, and a direct Windows API call for locking -
no app discovery or process matching needed for any of this.

Each function accepts an optional unused argument so it can be called
the same way as every other action (action_fn(arg)) from both the
regex router and the LLM fallback dispatcher, even though none of
these actually take a real argument.
"""

import ctypes
import logging
 
import pyautogui

log = logging.getLogger("signal")


def volume_up(_arg: str = "") -> str:
    pyautogui.press("volumeup")
    return "command accepted - volume up."


def volume_down(_arg: str = "") -> str:
    pyautogui.press("volumedown")
    return "command accepted - volume down."


def toggle_mute(_arg: str = "") -> str:
    pyautogui.press("volumemute")
    return "command accepted - toggling mute."


def play_pause(_arg: str = "") -> str:
    pyautogui.press("playpause")
    return "command accepted - toggling playback."


def next_track(_arg: str = "") -> str:
    pyautogui.press("nexttrack")
    return "command accepted - skipping to next track."


def previous_track(_arg: str = "") -> str:
    pyautogui.press("prevtrack")
    return "command accepted - going to previous track."


def lock_screen(_arg: str = "") -> str:
    try:
        ctypes.windll.user32.LockWorkStation()
        return "command accepted - locking the screen."
    except Exception:
        log.exception("failed to lock screen")
        return "something went wrong locking the screen."