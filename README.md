# Signal

A personal, local-first voice command assistant for Windows. Say a command,
Signal transcribes it, matches it to an action, does the thing, and talks
back to confirm.

> "open whatsapp" -> opens WhatsApp
> "shift this window to the left" -> snaps the active window left
> "search rtx 3050 drivers on google" -> opens the search in your browser

## Why this exists

A JARVIS-style assistant that runs entirely on your own machine, follows
rules you define, and doesn't send your voice to a cloud service unless
you explicitly want it to.

## Architecture

Signal is a **modular monolith** - one Python process, cleanly separated
into modules, not a distributed system. There's no scaling or multi-team
reason to split this into microservices; it would only add latency for
zero benefit. Two things run outside the process for practical reasons:

- **Ollama** - local LLM server, used only as a fallback when the regex
  intent table doesn't match a phrase.
- **Windows OS** - the actual target of actions (opening apps, snapping
  windows, opening the browser).

```
your voice
    |
    v
+---------------------------------------------+
|  Signal - single process                     |
|                                               |
|  [Audio in] -> [Decision] -> [Output]         |
|  wake word     intent +      voice reply      |
|  + STT         actions       + UI             |
+---------------------------------------------+
        |                    |
        v                    v
   [Ollama]             [Windows OS]
   local LLM             apps, windows,
   fallback only         browser
```

## Project structure

```
signal_assistant/
├── main.py                 # entry point - wires everything together
├── config.py               # app paths, wake word, TTS rate, whisper model
├── wakeword/listener.py    # openWakeWord - TODO, not built yet
├── stt/transcriber.py      # faster-whisper wrapper
├── intents/
│   ├── rules.py            # the declarative intent table
│   ├── router.py           # regex-first, LLM-fallback dispatch
│   └── llm_fallback.py     # Ollama fallback for fuzzy phrasing
├── actions/
│   ├── apps.py             # open_app
│   ├── windows.py          # snap_window
│   └── web.py              # search_google, search_amazon
├── voice/speaker.py        # pyttsx3 confirmations
├── storage/db.py           # SQLite conversation + command log
└── ui/                     # PyQt6 overlay - TODO, not built yet
    ├── overlay.py
    ├── orb_widget.py
    └── conversation_widget.py
```

## Setup

```bash
git clone https://github.com/<your-username>/signal-assistant.git
cd signal-assistant
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Update the paths in `config.py` (`APPS` dict) to match your machine -
right click each app's shortcut -> Properties -> Target.

```bash
python main.py
```

## Status

| Module | Status |
|---|---|
| STT (faster-whisper) | done |
| Intent router (regex + Ollama fallback) | done |
| Actions (open app, snap window, search) | done |
| Voice reply (pyttsx3) | done |
| Storage (SQLite log) | done |
| Wake word (openWakeWord) | not started |
| Desktop overlay (PyQt6, glowing orb + conversation) | not started |

## License

MIT
