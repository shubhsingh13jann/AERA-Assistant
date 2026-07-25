"""
Speech-to-text using faster-whisper, plus the short recording step that
runs right after the wake word fires. Runs locally on your GPU/CPU - no
network call, works offline.

pip install faster-whisper pyaudio
"""

import wave

import pyaudio
from faster_whisper import WhisperModel

from config import WHISPER_MODEL

_model = None
_RATE = 16000
_CHUNK = 1024


def _get_model():
    global _model
    if _model is None:
        # int8 quantization keeps this usable on a 4GB VRAM card
        _model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    return _model


def record_audio(path: str = "temp_clip.wav", seconds: float = 4.0) -> str:
    """Record a short clip from the mic (called right after the wake word fires)."""
    audio = pyaudio.PyAudio()
    stream = audio.open(format=pyaudio.paInt16, channels=1, rate=_RATE,
                         input=True, frames_per_buffer=_CHUNK)
    frames = [stream.read(_CHUNK) for _ in range(int(_RATE / _CHUNK * seconds))]
    stream.stop_stream()
    stream.close()
    audio.terminate()

    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(_RATE)
        wf.writeframes(b"".join(frames))
    return path


def transcribe(audio_path: str) -> str:
    """Transcribe a short audio clip and return the recognized text."""
    segments, _ = _get_model().transcribe(audio_path)
    return " ".join(seg.text for seg in segments).strip()