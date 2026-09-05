"""
High-fidelity Neural Text-To-Speech for Signal / JARVIS.
Uses Microsoft Edge Neural TTS ('en-GB-RyanNeural' - classic British JARVIS tone)
with automatic fallback to Windows SAPI (pyttsx3/win32com) if offline.
"""

import asyncio
import logging
import os
import queue
import tempfile
import threading
import time

log = logging.getLogger("signal")

_requests = queue.Queue()
_worker = None
_worker_lock = threading.Lock()

VOICE_NAME = "en-GB-RyanNeural"
_pygame_initialized = False


def _init_audio_player():
    global _pygame_initialized
    if not _pygame_initialized:
        try:
            import pygame
            pygame.mixer.init()
            _pygame_initialized = True
        except Exception as e:
            log.warning("Could not initialize pygame mixer: %s", e)


def _speak_edge_tts(text: str) -> bool:
    """Attempt neural TTS synthesis via edge-tts and playback via pygame."""
    try:
        import edge_tts
        import pygame

        _init_audio_player()
        if not _pygame_initialized:
            return False

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            temp_path = f.name

        async def _synthesize():
            comm = edge_tts.Communicate(text, VOICE_NAME, rate="+5%")
            await comm.save(temp_path)

        asyncio.run(_synthesize())

        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            pygame.mixer.music.load(temp_path)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(0.05)
            pygame.mixer.music.unload()
            try:
                os.remove(temp_path)
            except Exception:
                pass
            return True

    except Exception as e:
        log.warning("Edge-TTS synthesis failed (%s), falling back to SAPI.", e)

    return False


def _speak_sapi_fallback(text: str) -> None:
    """Fallback to native Windows SAPI voice if offline."""
    try:
        import pythoncom
        import win32com.client

        pythoncom.CoInitialize()
        try:
            voice = win32com.client.Dispatch("SAPI.SpVoice")
            voice.Rate = 0
            voice.Speak(text)
        finally:
            pythoncom.CoUninitialize()
    except Exception:
        log.exception("Windows SAPI TTS playback failed")


def _run_speaker():
    """Worker thread loop processing queued speech synthesis requests sequentially."""
    while True:
        text, finished = _requests.get()
        try:
            log.info("TTS speaking: %s", text)
            # Try high-quality British neural voice first
            success = _speak_edge_tts(text)
            if not success:
                # Fall back to Windows SAPI
                _speak_sapi_fallback(text)
            log.info("TTS finished")
        except Exception:
            log.exception("TTS playback encountered unhandled error")
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
    """Speak text and wait for playback to complete before returning."""
    if not text or not text.strip():
        return
    log.info("SIGNAL > %s", text)
    _ensure_worker()

    finished = threading.Event()
    _requests.put((text.strip(), finished))
    finished.wait()
