"""Reliable, serialized text-to-speech replies for the assistant."""

import logging
import queue
import threading

import pythoncom
import win32com.client

log = logging.getLogger("signal")

_requests = queue.Queue()
_worker = None
_worker_lock = threading.Lock()


def _run_speaker():
    """Speak one queued reply at a time through a fresh Windows SAPI voice."""

    while True:
        text, finished = _requests.get()
        try:
            log.info("TTS speaking: %s", text)
            # pyttsx3's reused engine speaks the startup message but can then
            # silently complete later requests. A fresh SAPI voice per reply
            # keeps the Windows audio session valid for Bluetooth headsets.
            pythoncom.CoInitialize()
            try:
                voice = win32com.client.Dispatch("SAPI.SpVoice")
                voice.Rate = 0
                voice.Speak(text)
            finally:
                pythoncom.CoUninitialize()
            log.info("TTS finished")
        except Exception:
            # Do not let a SAPI failure kill wake-word detection.
            log.exception("TTS playback failed")
        finally:
            finished.set()
            _requests.task_done()


def _ensure_worker():
    global _worker

    with _worker_lock:
        if _worker is None or not _worker.is_alive():
            _worker = threading.Thread(
                target=_run_speaker,
                name="signal-tts",
                daemon=True,
            )
            _worker.start()


def speak(text: str) -> None:
    """Speak text and wait for playback before the assistant resumes listening."""
    log.info("SIGNAL > %s", text)
    _ensure_worker()

    finished = threading.Event()
    _requests.put((text, finished))
    finished.wait()
