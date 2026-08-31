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


def _evaluate_javascript(script: str) -> None:
    """Send a UI update only while the pywebview window still exists."""
    window = _window
    if not window:
        return
    try:
        window.evaluate_js(script)
    except Exception:
        # The user may have closed the window while the audio loop is running.
        pass


def _on_window_closed():
    global _window
    _window = None


def start_ui(assistant_main):
    """
    assistant_main: the blocking wake-word/STT/router loop. pywebview
    runs it on a background thread automatically via func=, so the GUI
    event loop and the audio loop don't fight over the main thread -
    same problem PyQt6 would have had, solved the same way.
    """
    global _window
    _window = webview.create_window(
        "Signal // JARVIS MK-85",
        DIST_PATH,
        width=880,
        height=530,
        background_color="#07090c",
        resizable=True,
    )
    _window.events.closed += _on_window_closed
    webview.start(assistant_main, _window)


def set_orb_state(state: str) -> None:
    _evaluate_javascript(f"window.setOrbState('{state}')")


def add_message(role: str, text: str) -> None:
    safe_text = text.replace("'", "\\'")
    _evaluate_javascript(f"window.addMessage('{role}', '{safe_text}')")

def set_mic_level(device_name: str, level: int) -> None:
    safe_name = device_name.replace("'", "\\'")
    _evaluate_javascript(f"window.setMicLevel({level}, '{safe_name}')")
