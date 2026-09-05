"""
Desktop shell for the React UI, using pywebview instead of Electron -
loads the built Vite app (signal-ui/dist/index.html) into a native
window. No Node runtime, no Chromium bundle, no separate backend
server: Python talks straight to the page via evaluate_js.

pip install pywebview
Build the frontend first: cd signal-ui && npm run build
"""

import os
import json
import threading
import time
import webview

DIST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "signal-ui", "dist", "index.html"))

_window = None


def _evaluate_javascript(script: str) -> None:
    """Send a UI update only while the pywebview window still exists."""
    window = _window
    if not window:
        return
    try:
        window.evaluate_js(script)
    except Exception:
        pass


def _on_window_closed():
    global _window
    _window = None


try:
    import psutil
except ImportError:
    psutil = None


class JSBridge:
    def process_text_command(self, text: str) -> None:
        """Called from frontend when user submits text via keyboard instead of mic."""
        def worker():
            from intents.router import route
            from voice.speaker import speak
            from storage.db import log_message

            text_clean = text.strip()
            if not text_clean:
                return

            set_orb_state("listening")
            add_message("you", text_clean)
            log_message("you", text_clean)

            lower = text_clean.lower()
            if lower in ["hey jarvis", "hi jarvis", "jarvis", "hello jarvis"]:
                time.sleep(0.2)
                set_orb_state("speaking")
                response = "Yes boss."
                add_message("assistant", response)
                log_message("assistant", response)
                speak(response)
                set_orb_state("idle")
                return

            set_orb_state("processing")
            time.sleep(0.3)
            try:
                response = route(text_clean)
                if isinstance(response, dict):
                    speech = response.get("speech", response.get("text", ""))
                    text_display = response.get("text", speech)
                    card = response.get("card")
                    set_orb_state("speaking")
                    add_message("assistant", text_display, card=card)
                    log_message("assistant", speech)
                    speak(speech)
                else:
                    resp_lower = str(response).lower()
                    is_negative = any(kw in resp_lower for kw in ["couldn't", "can't", "failed", "error", "reject", "unable", "not found", "invalid", "unknown"])
                    if is_negative:
                        set_orb_state("error")
                    else:
                        set_orb_state("speaking")
                    add_message("assistant", str(response))
                    log_message("assistant", str(response))
                    speak(str(response))
            except Exception as e:
                set_orb_state("error")
                error_msg = f"Command execution failed: {str(e)}"
                add_message("assistant", error_msg)
                log_message("assistant", error_msg)

            time.sleep(3.0)
            set_orb_state("idle")

        threading.Thread(target=worker, daemon=True).start()


def _telemetry_worker():
    """Periodically sample real host metrics and send them to the React UI."""
    if psutil:
        try:
            psutil.cpu_percent(interval=None)
        except Exception:
            pass

    while _window is not None:
        if psutil:
            try:
                cpu_pct = psutil.cpu_percent(interval=None)
                cpu_freq = psutil.cpu_freq()
                mem = psutil.virtual_memory()
                disk = psutil.disk_usage('C:')
                pids = len(psutil.pids())

                payload = {
                    "cpuPercent": cpu_pct,
                    "cpuFreq": cpu_freq.current if cpu_freq else 1700,
                    "memPercent": mem.percent,
                    "memUsed": round(mem.used / (1024**3), 1),
                    "memTotal": round(mem.total / (1024**3), 1),
                    "diskPercent": disk.percent,
                    "processes": pids,
                }
                json_str = json.dumps(payload)
                _evaluate_javascript(f"window.updateHostTelemetry && window.updateHostTelemetry({json_str});")
            except Exception:
                pass
        time.sleep(1.5)


def start_ui(assistant_main):
    global _window
    bridge = JSBridge()
    _window = webview.create_window(
        "Signal // JARVIS MK-85",
        DIST_PATH,
        js_api=bridge,
        width=1400,
        height=850,
        min_size=(1024, 620),
        background_color="#030712",
        resizable=True,
    )
    _window.events.closed += _on_window_closed

    threading.Thread(target=_telemetry_worker, daemon=True).start()
    webview.start(assistant_main, _window)


def set_orb_state(state: str) -> None:
    _evaluate_javascript(f"window.setOrbState('{state}')")


def add_message(role: str, text: str, card=None) -> None:
    payload = {"role": role, "text": text}
    if card:
        payload["card"] = card
    json_str = json.dumps(payload)
    safe_text = text.replace("'", "\\'").replace("\n", " ")
    _evaluate_javascript(f"window.addStructuredMessage ? window.addStructuredMessage({json_str}) : window.addMessage('{role}', '{safe_text}');")


def set_mic_level(device_name: str, level: int) -> None:
    safe_name = device_name.replace("'", "\\'")
    _evaluate_javascript(f"window.setMicLevel({level}, '{safe_name}')")
