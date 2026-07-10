"""
Wake word detection using openWakeWord.

Runs continuously on a low-power audio stream; only hands off to STT
once the wake phrase is detected, so full transcription doesn't run
on every second of audio all day.

pip install openwakeword
"""


def listen_for_wake_word(on_detected):
    """
    Blocks, listening on the default mic for the wake word.
    Calls on_detected() once triggered.
    """
    raise NotImplementedError("Wire up the openWakeWord model + audio stream here.")
