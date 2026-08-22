# Signal

Signal is a local-first Windows voice assistant for everyday desktop actions. Wake it with **“Hey Jarvis”**, say a command, and Signal can open applications, search the web, manage windows, and respond by voice.

> Built for a private, hands-free desktop experience with on-device wake-word detection and speech recognition.

## Highlights

- **Wake-word activation** with openWakeWord (`Hey Jarvis`)
- **Offline speech recognition** powered by faster-whisper
- **Desktop app control** with Start Menu, PATH, and cached app discovery
- **Natural command handling** using fast rule-based intents with an optional local Ollama fallback
- **Voice confirmations** through Windows SAPI
- **Desktop UI** built with React, Vite, and pywebview
- **Automatic microphone selection** with Bluetooth headset fallback support

## What you can say

| Say | Result |
| --- | --- |
| `Open Notepad` | Launches Notepad |
| `Open Visual Studio Code` | Launches VS Code |
| `Open GitHub Desktop` | Launches GitHub Desktop |
| `Search Hanuman Chalisa on YouTube` | Opens YouTube search results |
| `Search RTX 3050 drivers on Google` | Searches Google |
| `Open Amazon and search wireless mouse` | Searches Amazon |
| `Move this window to the left` | Snaps the active window left |
| `Close Notepad` | Closes a supported running application |

## Prerequisites

- Windows 10 or Windows 11
- Python 3.10+
- A working microphone or Bluetooth headset
- [Ollama](https://ollama.com/) and the configured local model for flexible, non-rule-based commands
- Node.js 18+ only when rebuilding the React interface

## Installation

```powershell
git clone https://github.com/<your-username>/signal-assistant.git
cd signal-assistant
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Install the configured Ollama model:

```powershell
ollama pull llama3.2:3b
```

Build the interface once:

```powershell
cd signal-ui
npm install
npm run build
cd ..
```

## Configuration

Update [config.py](config.py) for your machine:

- `APPS` — application paths and Windows App IDs
- `AUDIO_INPUT_NAME` — leave blank for automatic microphone selection, or set part of a device name to force a particular microphone
- `WAKE_THRESHOLD` — wake-word sensitivity; lower values wake more easily but can cause false activations
- `OLLAMA_MODEL` — the local model used for fallback command interpretation

Signal automatically prefers a working headset or earbud microphone at 16 kHz and falls back to another available Windows input device when needed.

## Run

```powershell
python main.py
```

During startup, speak during the microphone check. Signal will show the selected input device and audio level before arming the wake word.

## Development

Run the test suite:

```powershell
python -m pytest
```

Run the React interface during UI development:

```powershell
cd signal-ui
npm run dev
```

## Project layout

| Path | Purpose |
| --- | --- |
| `main.py` | Application entry point and voice-command flow |
| `wakeword/` | Wake-word listener and microphone diagnostics |
| `stt/` | Audio recording and faster-whisper transcription |
| `intents/` | Rule-based routing and Ollama fallback |
| `actions/` | Application, browser, window, and close actions |
| `voice/` | Windows text-to-speech responses |
| `storage/` | SQLite command and app cache storage |
| `ui/` | pywebview bridge for the desktop interface |
| `signal-ui/` | React/Vite frontend |

## Notes

- Built-in wake-word models are downloaded by openWakeWord on first use.
- Some Microsoft Store and browser/PWA apps may need a specific process or window mapping for reliable close commands.
- All wake-word detection and speech recognition run locally. Ollama is only used when a command does not match a built-in rule.

## License

Released under the [MIT License](LICENSE).
