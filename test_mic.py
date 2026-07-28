"""
Standalone mic + wake word test, now with explicit device selection -
the earlier run used whatever Windows marked as default, which was
the laptop's built-in mic array, not your headset.
"""

import numpy as np
import pyaudio
import openwakeword
from openwakeword.model import Model

from audio_devices import resolve_input_device


def main():
    openwakeword.utils.download_models()
    model = Model()

    audio = pyaudio.PyAudio()
    device_index, device_name, rate = resolve_input_device(audio)
    print(f"Using device [{device_index}]: {device_name}")
    stream = audio.open(
        format=pyaudio.paInt16, channels=1, rate=rate,
        input=True, input_device_index=device_index, frames_per_buffer=1280,
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
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()


if __name__ == "__main__":
    main()
