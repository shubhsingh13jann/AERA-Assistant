"""
Desktop shell for the React UI, using pywebview instead of Electron -
loads the built Vite app (signal-ui/dist/index.html) into a native
window. No Node runtime, no Chromium bundle, no separate backend
server: Python talks straight to the page via evaluate_js.

pip install pywebview
Build the frontend first: cd signal-ui && npm run build
"""

import os
import webview

DIST_PATH = os.path.join(os.path.dirname(__file__), "..", "signal-ui", "dist", "index.html")

_window = None


def start_ui(assistant_main):
    """
    assistant_main: the blocking wake-word/STT/router loop. pywebview
    runs it on a background thread automatically via func=, so the GUI
    event loop and the audio loop don't fight over the main thread -
    same problem PyQt6 would have had, solved the same way.
    """
    global _window
    _window = webview.create_window("Signal", DIST_PATH, width=760, height=460)
    webview.start(assistant_main, _window)


def set_orb_state(state: str) -> None:
    if _window:
        _window.evaluate_js(f"window.setOrbState('{state}')")


def add_message(role: str, text: str) -> None:
    if _window:
        safe_text = text.replace("'", "\\'")
        _window.evaluate_js(f"window.addMessage('{role}', '{safe_text}')")

def set_mic_level(device_name: str, level: int) -> None:
    if _window:
        safe_name = device_name.replace("'", "\\'")
        _window.evaluate_js(f"window.setMicLevel({level}, '{safe_name}')")