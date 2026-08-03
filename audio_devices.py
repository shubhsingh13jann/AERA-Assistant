"""Resolve the best available Windows microphone on each stream open."""

import logging

import pyaudio

from config import AUDIO_INPUT_NAME, AUDIO_INPUT_RATE

log = logging.getLogger("signal")


def resolve_input_device(audio):
    """Return the best usable input device and the 16 kHz wake-word rate.

    openWakeWord expects 16 kHz mono PCM.  Windows/PyAudio performs the
    conversion for a device whose native rate differs.  In automatic mode we
    prefer the current Windows default, then a connected headset/earbuds
    endpoint, and finally another available microphone.  This avoids binding
    the app to a stale Bluetooth device index or one specific headset name.
    """
    requested_name = AUDIO_INPUT_NAME.lower().strip()
    candidates = []
    default_index = _default_input_index(audio)

    for index in range(audio.get_device_count()):
        info = audio.get_device_info_by_index(index)
        if not info.get("maxInputChannels"):
            continue
        name = info["name"]
        name_lower = name.lower()
        if requested_name and requested_name not in name_lower:
            continue

        api_name = audio.get_host_api_info_by_index(info["hostApi"])["name"]
        native_rate = int(info["defaultSampleRate"])
        is_wasapi = "wasapi" in api_name.lower()
        is_headset = any(word in name_lower for word in (
            "headset", "headphone", "earbud", "buds", "hands-free", "airpods",
        ))
        is_default = index == default_index

        # A manually configured device name takes precedence.  Otherwise use
        # Windows' selected input first, followed by modern Bluetooth/WASAPI
        # headset endpoints and then any remaining microphone.
        priority = (
            0 if requested_name and is_wasapi and native_rate == AUDIO_INPUT_RATE
            else 1 if requested_name and native_rate == AUDIO_INPUT_RATE
            else 2 if requested_name
            else 3 if is_headset and native_rate == AUDIO_INPUT_RATE
            else 4 if is_headset and is_wasapi
            else 5 if is_default and is_wasapi and native_rate == AUDIO_INPUT_RATE
            else 6 if is_default and "sound mapper" not in name_lower
            else 7 if is_wasapi and native_rate == AUDIO_INPUT_RATE
            else 8 if native_rate == AUDIO_INPUT_RATE
            else 9 if is_wasapi
            else 10
        )
        candidates.append((priority, index, name, native_rate, api_name))

    if not candidates:
        if requested_name:
            raise RuntimeError(f"Preferred microphone {AUDIO_INPUT_NAME!r} is not available.")
        raise RuntimeError("No Windows microphone input device is available.")

    for _, index, name, native_rate, api_name in sorted(candidates):
        if not _can_open_wake_stream(audio, index):
            log.warning("skipping unavailable input device [%d]: %s", index, name)
            continue
        log.info(
            "using input device [%d]: %s (host=%s, native_rate=%d)",
            index, name, api_name, native_rate,
        )
        return index, name, AUDIO_INPUT_RATE

    raise RuntimeError("No available microphone supports the 16 kHz wake-word stream.")


def _default_input_index(audio):
    """Return the current Windows-default input index, if PyAudio exposes it."""
    try:
        return audio.get_default_input_device_info()["index"]
    except (OSError, IOError):
        return None


def _can_open_wake_stream(audio, device_index):
    """Reject stale Bluetooth endpoints that Windows still lists as inputs."""
    stream = None
    try:
        stream = audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=AUDIO_INPUT_RATE,
            input=True,
            input_device_index=device_index,
            frames_per_buffer=160,
        )
        return True
    except (OSError, IOError):
        return False
    finally:
        if stream is not None:
            stream.close()
