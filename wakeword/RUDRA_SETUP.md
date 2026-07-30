# Rudra wake-word setup

The assistant is ready to use these custom OpenWakeWord models:

```
wakeword/models/rudra.onnx
wakeword/models/hey_rudra.onnx
```

Create and download both models from the official OpenWakeWord training site:

1. Sign in at https://openwakeword.com/.
2. Create a model for `Rudra` and download its ONNX file.
3. Create a second model for `Hey Rudra` and download its ONNX file.
4. Rename the downloaded files exactly as shown above and place them in `wakeword/models/`.
5. Restart the assistant.

At startup, the log will confirm `custom wake-word models loaded`. Until both
files are present, the assistant deliberately continues to listen for the
existing `hey_jarvis` model so it remains usable.

When either Rudra model detects a wake phrase, Signal says `Yes boss.` before
recording the command.
