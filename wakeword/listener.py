"""
Wake word detection using openWakeWord.

Uses a pretrained model as a placeholder so the pipeline is testable
today ("hey_jarvis" ships with the library - that's just its name in
the open-source project, unrelated to training your own "hey signal"
phrase later - see the note at the bottom).

pip install openwakeword pyaudio numpy
"""

import logging

import numpy as np
import pyaudio
import openwakeword
from openwakeword.model import Model

log = logging.getLogger("signal")

CHUNK = 1280           # 80ms at 16kHz - the frame size openWakeWord expects
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
THRESHOLD = 0.35        # lowered from 0.5 - headset peaks around 0.4-0.5

DEVICE_INDEX = 2        # your headset - confirmed working in test_mic.py

WAKE_KEY = "hey_jarvis"  # dictionary key in the prediction result, not a filename


def listen_for_wake_word(on_detected):
    """
    Blocks, listening on the default mic for the wake word.
    Calls on_detected() every time it triggers, then keeps listening.
    """
    log.info("checking openWakeWord models (downloads once, cached after)...")
    openwakeword.utils.download_models()

    model = Model()
    log.info("models loaded: %s", list(model.models.keys()))

    audio = pyaudio.PyAudio()
    stream = audio.open(
        format=FORMAT, channels=CHANNELS, rate=RATE,
        input=True, input_device_index=DEVICE_INDEX, frames_per_buffer=CHUNK,
    )
    log.info("listening for wake word %r on device %s - say it now", WAKE_KEY, DEVICE_INDEX)

    frame_count = 0
    try:
        while True:
            raw = stream.read(CHUNK, exception_on_overflow=False)
            chunk = np.frombuffer(raw, dtype=np.int16)
            predictions = model.predict(chunk)

            frame_count += 1
            if frame_count % 25 == 0:
                log.info("listening... score: %.3f", predictions.get(WAKE_KEY, 0.0))

            score = predictions.get(WAKE_KEY, 0.0)
            if score > THRESHOLD:
                log.info("wake word detected (score=%.3f)", score)
                model.reset()
                on_detected()
                # Discard whatever got buffered while we were recording/
                # speaking, so we don't immediately re-trigger on our own
                # reply bleeding back into the mic.
                stream.stop_stream()
                stream.start_stream()
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()


# ---------------------------------------------------------------------------
# Training your own "hey signal" wake word (later, not a blocker today):
#   1. pip install openwakeword[train]
#   2. Use openWakeWord's training notebook - it generates synthetic TTS
#      training clips for your custom phrase.
#   3. Drop the resulting model into wakeword/models/ and point WAKE_KEY
#      at it instead of "hey_jarvis".
# ---------------------------------------------------------------------------