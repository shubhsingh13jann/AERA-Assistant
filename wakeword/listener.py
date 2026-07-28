"""
Wake word detection using openWakeWord, with indefinite retry/backoff
on audio stream errors (a Bluetooth headset turning off should never
permanently kill the assistant), and a live mic level pushed via
on_level() so the UI can show real-time status, including when the
device is disconnected.
"""

import time
import logging

import numpy as np
import pyaudio
import openwakeword
from openwakeword.model import Model

from audio_devices import resolve_input_device

log = logging.getLogger("signal")

CHUNK = 1280
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
THRESHOLD = 0.20
WAKE_KEY = "hey_jarvis"

LEVEL_SCALE_MAX = 8000
LEVEL_PUSH_EVERY_N_FRAMES = 5
MAX_RETRY_DELAY = 5.0


def _open_stream_with_retry(audio, on_level):
    """Retries forever with capped backoff - a headset being off is a
    temporary condition, not a reason to give up permanently."""
    delay = 0.5
    attempt = 0
    while True:
        attempt += 1
        try:
            device_index, device_name, rate = resolve_input_device(audio)
            stream = audio.open(
                format=FORMAT, channels=CHANNELS, rate=rate,
                input=True, input_device_index=device_index, frames_per_buffer=CHUNK,
            )
            if attempt > 1:
                log.info("stream reopened successfully after %d attempts", attempt)
            return stream, device_name
        except (OSError, RuntimeError) as e:
            if on_level:
                on_level("Preferred microphone (disconnected)", 0)
            log.warning("stream open failed (attempt %d) - %s, retrying in %.1fs", attempt, e, delay)
            time.sleep(delay)
            delay = min(delay * 1.5, MAX_RETRY_DELAY)


def listen_for_wake_word(on_detected, on_level=None):
    log.info("checking openWakeWord models (downloads once, cached after)...")
    openwakeword.utils.download_models()

    model = Model()
    log.info("models loaded: %s", list(model.models.keys()))

    audio = pyaudio.PyAudio()
    stream, device_name = _open_stream_with_retry(audio, on_level)
    log.info("listening for wake word %r on %r - say it now", WAKE_KEY, device_name)

    frame_count = 0
    try:
        while True:
            try:
                raw = stream.read(CHUNK, exception_on_overflow=False)
            except OSError:
                log.warning("audio stream error - device likely disconnected, retrying...")
                try:
                    stream.stop_stream()
                    stream.close()
                except Exception:
                    pass
                if on_level:
                    on_level(f"{device_name} (disconnected)", 0)
                model.reset()
                stream, device_name = _open_stream_with_retry(audio, on_level)
                continue

            chunk = np.frombuffer(raw, dtype=np.int16)
            peak = int(np.max(np.abs(chunk))) if len(chunk) else 0
            predictions = model.predict(chunk)

            frame_count += 1
            level_pct = min(100, int(peak / LEVEL_SCALE_MAX * 100))

            if frame_count % LEVEL_PUSH_EVERY_N_FRAMES == 0:
                bar_len = level_pct // 4  # 25 chars max
                bar = "#" * bar_len + "-" * (25 - bar_len)
                log.info("mic [%s] %3d%%   wake score: %.3f", bar, level_pct, predictions.get(WAKE_KEY, 0.0))
                if on_level:
                    on_level(device_name, level_pct)

            score = predictions.get(WAKE_KEY, 0.0)
            if score > THRESHOLD:
                log.info("wake word detected (score=%.3f)", score)
                model.reset()

                stream.stop_stream()
                stream.close()
                time.sleep(0.2)

                on_detected()

                stream, device_name = _open_stream_with_retry(audio, on_level)
    finally:
        try:
            stream.stop_stream()
            stream.close()
        except Exception:
            pass
        audio.terminate()
