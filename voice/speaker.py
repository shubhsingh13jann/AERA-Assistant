"""Text-to-speech confirmations - what actually gets spoken aloud."""

import logging

import pyttsx3

from config import TTS_RATE

log = logging.getLogger("signal")
_tts = pyttsx3.init()
_tts.setProperty("rate", TTS_RATE)


def speak(text: str) -> None:
    log.info("SIGNAL > %s", text)
    _tts.say(text)
    _tts.runAndWait()
