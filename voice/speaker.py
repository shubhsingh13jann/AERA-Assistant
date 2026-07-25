"""
Text-to-speech confirmations. The engine is created lazily, on first
call to speak() - on whichever thread that turns out to be - instead
of at import time.

Why: pyttsx3 on Windows drives SAPI5 through COM. If the engine gets
created on the main thread (which happens automatically if you call
pyttsx3.init() at import time) and then speak() is called from a
different thread - like pywebview's background assistant thread -
runAndWait() can hang forever with no error at all. Building the
engine on the same thread it's actually used from avoids that.
"""

import logging
import threading

import pyttsx3

from config import TTS_RATE

log = logging.getLogger("signal")

_tts = None
_lock = threading.Lock()


def _get_engine():
    global _tts
    with _lock:
        if _tts is None:
            _tts = pyttsx3.init()
            _tts.setProperty("rate", TTS_RATE)
    return _tts


def speak(text: str) -> None:
    log.info("SIGNAL > %s", text)
    engine = _get_engine()
    engine.say(text)
    engine.runAndWait()