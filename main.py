"""
Entry point - launches the Signal desktop UI (pywebview + React) and
runs the wake word -> record -> STT -> intent router -> voice reply
loop on a background thread.
"""

import logging

from wakeword.listener import listen_for_wake_word
from wakeword.mic_check import run_mic_check
from stt.transcriber import record_audio, transcribe
from intents.router import route
from voice.speaker import speak
from storage.db import init_db, log_message
from ui.overlay import start_ui, set_orb_state, add_message, set_mic_level

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
    try:
        init_db()
        run_mic_check()
        speak("signal online. mic armed.")
        listen_for_wake_word(on_detected=on_wake, on_level=set_mic_level)
    except Exception:
        log.exception("assistant thread crashed")


if __name__ == "__main__":
    start_ui(run_assistant)
