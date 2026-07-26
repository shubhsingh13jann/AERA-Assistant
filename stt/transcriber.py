"""
Speech-to-text using faster-whisper, plus the short recording step that
runs right after the wake word fires. Runs locally on CPU - no network
call, works offline.

pip install faster-whisper pyaudio numpy
"""

import logging
import wave

import numpy as np
import pyaudio
from faster_whisper import WhisperModel

from config import WHISPER_MODEL

log = logging.getLogger("signal")

_model = None
_RATE = 16000
_CHUNK = 1024
DEVICE_INDEX = 2  # same headset used for wake word - keep in sync with wakeword/listener.py


def _get_model():
    global _model
    if _model is None:
        _model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    return _model


def record_audio(path: str = "temp_clip.wav", seconds: float = 5.0) -> str:
    """Record a short clip from the mic (called right after the wake word fires)."""
    audio = pyaudio.PyAudio()
    stream = audio.open(format=pyaudio.paInt16, channels=1, rate=_RATE,
                         input=True, input_device_index=DEVICE_INDEX,
                         frames_per_buffer=_CHUNK)
    frames = [stream.read(_CHUNK, exception_on_overflow=False)
              for _ in range(int(_RATE / _CHUNK * seconds))]
    stream.stop_stream()
    stream.close()
    audio.terminate()

    raw = b"".join(frames)
    samples = np.frombuffer(raw, dtype=np.int16)
    peak = int(np.max(np.abs(samples))) if len(samples) else 0
    log.info("recorded clip - peak amplitude: %d / 32768 (louder = higher)", peak)

    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(_RATE)
        wf.writeframes(raw)
    return path


def transcribe(audio_path: str) -> str:
    """Transcribe a short audio clip and return the recognized text."""
    segments, _ = _get_model().transcribe(audio_path, vad_filter=True)
    return " ".join(seg.text for seg in segments).strip()