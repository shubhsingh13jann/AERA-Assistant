"""
System and media control - volume, playback, lock screen. Uses direct
Windows APPCOMMAND messages for play/pause (explicit, not the ambiguous
toggle key - "play" always plays, "hold" always pauses, regardless of
current state) and pyautogui for volume/track keys, which are already
directional and don't have the same ambiguity problem.
"""

import ctypes
import logging

import pyautogui
from ctypes import wintypes

log = logging.getLogger("signal")

WM_APPCOMMAND = 0x0319
APPCOMMAND_MEDIA_PLAY = 46
APPCOMMAND_MEDIA_PAUSE = 47
APPCOMMAND_MEDIA_PLAY_PAUSE = 14


def _send_appcommand(cmd: int) -> None:
    hwnd = ctypes.windll.user32.GetForegroundWindow()
    ctypes.windll.user32.SendMessageW(hwnd, WM_APPCOMMAND, hwnd, cmd * 65536)


def volume_up(_arg: str = "") -> str:
    pyautogui.press("volumeup")
    return "command accepted - volume up."


def volume_down(_arg: str = "") -> str:
    pyautogui.press("volumedown")
    return "command accepted - volume down."


def set_volume(percent: str) -> str:
    """Set system volume to an exact percentage using the Windows Core
    Audio API (pycaw) - not simulated key presses, a direct level set."""
    try:
        pct = max(0, min(100, int("".join(c for c in percent if c.isdigit()))))
    except ValueError:
        return "I couldn't understand that volume percentage."

    try:
        from ctypes import cast, POINTER
        from comtypes import CLSCTX_ALL
        from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume = cast(interface, POINTER(IAudioEndpointVolume))
        volume.SetMasterVolumeLevelScalar(pct / 100.0, None)
        return f"command accepted - volume set to {pct} percent."
    except Exception:
        log.exception("failed to set volume to %s%%", pct)
        return "something went wrong setting the volume."


def toggle_mute(_arg: str = "") -> str:
    pyautogui.press("volumemute")
    return "command accepted - toggling mute."


def play_pause(_arg: str = "") -> str:
    _send_appcommand(APPCOMMAND_MEDIA_PLAY)
    return "command accepted - playing."


def hold_pause(_arg: str = "") -> str:
    _send_appcommand(APPCOMMAND_MEDIA_PAUSE)
    return "command accepted - pausing."


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