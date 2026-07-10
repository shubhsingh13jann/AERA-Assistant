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

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("signal")


def on_wake():
    # TODO: record a short clip after wake word triggers, save to a temp path
    audio_path = "temp_clip.wav"
    heard = transcribe(audio_path)
    if not heard:
        return
    log.info("YOU   > %s", heard)
    log_message("you", heard)

    response = route(heard)
    log_message("assistant", response)
    speak(response)


def main():
    init_db()
    speak("signal online. mic armed.")
    listen_for_wake_word(on_detected=on_wake)


if __name__ == "__main__":
    main()
