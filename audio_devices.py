"""Resolve the preferred Windows microphone on each stream open."""

import logging

from config import AUDIO_INPUT_NAME, AUDIO_INPUT_RATE

log = logging.getLogger("signal")


def resolve_input_device(audio):
    """Return the best matching microphone index, name, and sample rate.

    The same Bluetooth headset appears through several Windows audio APIs.
    Prefer its WASAPI endpoint at the 16 kHz rate required by openWakeWord.
    """
    requested_name = AUDIO_INPUT_NAME.lower()
    candidates = []

    for index in range(audio.get_device_count()):
        info = audio.get_device_info_by_index(index)
        if not info.get("maxInputChannels"):
            continue
        if requested_name not in info["name"].lower():
            continue

        api_name = audio.get_host_api_info_by_index(info["hostApi"])["name"]
        native_rate = int(info["defaultSampleRate"])
        is_wasapi = "wasapi" in api_name.lower()
        priority = (
            0 if is_wasapi and native_rate == AUDIO_INPUT_RATE
            else 1 if native_rate == AUDIO_INPUT_RATE
            else 2 if is_wasapi
            else 3
        )
        candidates.append((priority, index, info["name"], native_rate, api_name))

    if not candidates:
        raise RuntimeError(f"Preferred microphone {AUDIO_INPUT_NAME!r} is not available.")

    _, index, name, native_rate, api_name = min(candidates)
    log.info(
        "using input device [%d]: %s (host=%s, native_rate=%d)",
        index, name, api_name, native_rate,
    )
    return index, name, AUDIO_INPUT_RATE
