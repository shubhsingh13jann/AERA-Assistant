"""
Standalone mic + wake word test, now with explicit device selection -
the earlier run used whatever Windows marked as default, which was
the laptop's built-in mic array, not your headset.
"""

import numpy as np
import pyaudio
import openwakeword
from openwakeword.model import Model

# Change this to test different devices. From your device list:
#   2  -> Headset (OnePlus BulletsWireless...)
#   30 -> Microphone (Realtek HD Audio Mic input)
DEVICE_INDEX = 2

openwakeword.utils.download_models()
model = Model()

audio = pyaudio.PyAudio()
info = audio.get_device_info_by_index(DEVICE_INDEX)
print(f"Using device [{DEVICE_INDEX}]: {info['name']}")
print(f"  default sample rate: {info['defaultSampleRate']}, max input channels: {info['maxInputChannels']}")

stream = audio.open(
    format=pyaudio.paInt16, channels=1, rate=16000,
    input=True, input_device_index=DEVICE_INDEX, frames_per_buffer=1280,
)
print("\nListening on that device... say 'hey jarvis' clearly, close to the mic. Ctrl+C to stop.\n")

frame_count = 0
try:
    while True:
        raw = stream.read(1280, exception_on_overflow=False)
        chunk = np.frombuffer(raw, dtype=np.int16)
        predictions = model.predict(chunk)
        frame_count += 1
        if frame_count % 10 == 0:
            print(f"score: {predictions.get('hey_jarvis', 0.0):.3f}")
except KeyboardInterrupt:
    print("stopped")