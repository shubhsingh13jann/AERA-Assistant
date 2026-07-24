"""
Entry point - wires wake word -> STT -> intent router -> voice reply
together. Run this to start the assistant.
"""

import logging

from wakeword.listener import listen_for_wake_word
from stt.transcriber import transcribe
from intents.router import route
from voice.speaker import speak
from storage.db import init_db, log_message
from ui.overlay import set_orb_state, add_message, start_ui

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("signal")


def on_wake():
    set_orb_state("listening")
    audio_path = record_audio(seconds=4.0)
    heard = transcribe(audio_path)
    if not heard:
        set_orb_state("idle")
        return
    add_message("you", heard)
    log_message("you", heard)

    set_orb_state("speaking")
    response = route(heard)
    add_message("assistant", response)
    log_message("assistant", response)
    speak(response)
    set_orb_state("idle")


def main():
    init_db()
    speak("signal online. mic armed.")
    listen_for_wake_word(on_detected=on_wake)

def run_assistant(window):
    init_db()
    speak("signal online. mic armed.")
    listen_for_wake_word(on_detected=on_wake)


if __name__ == "__main__":
    start_ui(run_assistant)
