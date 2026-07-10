"""
Speech-to-text using faster-whisper. Runs locally on your GPU/CPU -
no network call, works offline.

pip install faster-whisper
"""

from faster_whisper import WhisperModel
from config import WHISPER_MODEL

_model = None


def _get_model():
    global _model
    if _model is None:
        # int8 quantization keeps this usable on a 4GB VRAM card
        _model = WhisperModel(WHISPER_MODEL, device="cuda", compute_type="int8")
    return _model


def transcribe(audio_path: str) -> str:
    """Transcribe a short audio clip and return the recognized text."""
    segments, _ = _get_model().transcribe(audio_path)
    return " ".join(seg.text for seg in segments).strip()
