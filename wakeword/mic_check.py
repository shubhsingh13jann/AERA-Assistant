"""
Pre-flight mic check - runs once before the main loop starts. Prints
which device is being used and a live level bar, so you can confirm
the mic is actually working before waiting on the wake word.
"""

import time

import numpy as np
import pyaudio

from audio_devices import resolve_input_device


def run_mic_check(rate: int = 16000, chunk: int = 1280, seconds: float = 3.0) -> None:
    audio = pyaudio.PyAudio()
    device_index, device_name, rate = resolve_input_device(audio)
    info = audio.get_device_info_by_index(device_index)
    print(f"\nmic check - using device [{device_index}]: {device_name}")
    print(f"  native sample rate: {info['defaultSampleRate']}, channels: {info['maxInputChannels']}")

    stream = audio.open(format=pyaudio.paInt16, channels=1, rate=rate,
                         input=True, input_device_index=device_index, frames_per_buffer=chunk)
    print("  speak now to confirm the signal is reaching this mic...")

    end_time = time.time() + seconds
    peak_overall = 0
    while time.time() < end_time:
        raw = stream.read(chunk, exception_on_overflow=False)
        samples = np.frombuffer(raw, dtype=np.int16)
        peak = int(np.max(np.abs(samples))) if len(samples) else 0
        peak_overall = max(peak_overall, peak)
        bar_len = min(40, peak // 400)
        print(f"\r  level: [{'#' * bar_len:<40}] {peak:5d}/32768", end="", flush=True)

    stream.stop_stream()
    stream.close()
    audio.terminate()
    print()

    if peak_overall < 500:
        print("  warning: very quiet signal - check the mic isn't muted or the wrong device is selected.\n")
    else:
        print(f"  mic check passed - peak {peak_overall}/32768 detected.\n")
