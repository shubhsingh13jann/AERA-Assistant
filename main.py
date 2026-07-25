"""
Entry point - launches the Signal desktop UI (pywebview + React) and
runs the wake word -> record -> STT -> intent router -> voice reply
loop on a background thread.
"""

import logging
""" import os
import nvidia.cublas.lib
import nvidia.cudnn.lib

os.environ["PATH"] = (
    os.path.dirname(nvidia.cublas.lib.__file__) + os.pathsep +
    os.path.dirname(nvidia.cudnn.lib.__file__) + os.pathsep +
    os.environ["PATH"]
) """

from wakeword.listener import listen_for_wake_word
from stt.transcriber import record_audio, transcribe
from intents.router import route
from voice.speaker import speak
from storage.db import init_db, log_message
from ui.overlay import start_ui, set_orb_state, add_message


logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("signal")


def on_wake():
    set_orb_state("listening")
    log.info("wake word detected, recording command...")
    audio_path = record_audio(seconds=4.0)
    heard = transcribe(audio_path)
    if not heard:
        set_orb_state("idle")
        return

    log.info("YOU   > %s", heard)
    add_message("you", heard)
    log_message("you", heard)

    set_orb_state("speaking")
    response = route(heard)
    add_message("assistant", response)
    log_message("assistant", response)
    speak(response)
    set_orb_state("idle")


def run_assistant(window):
    """Runs on pywebview's background thread - the window itself runs
    on the main thread, so this blocking loop never freezes the UI."""
    try:
        init_db()
        speak("signal online. mic armed.")
        listen_for_wake_word(on_detected=on_wake)
    except Exception:
        log.exception("assistant thread crashed")


if __name__ == "__main__":
    start_ui(run_assistant)