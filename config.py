"""Central configuration - paths, constants, settings."""

APPS = {
    "whatsapp": r"shell:AppsFolder\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
    "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "vscode": r"D:\Microsoft VS Code\Code.exe",
    "netflix": r"shell:AppsFolder\4DF9E0F8.Netflix_mcm4njqhnhss8!Netflix.App",
}

# Built-in openWakeWord model used by the assistant.
WAKE_WORD = "hey_jarvis"
WAKE_THRESHOLD = 0.20
TTS_RATE = 178
WHISPER_MODEL = "small.en"

# Match the headset by name instead of a fragile PyAudio device number. Windows
# can change device indexes whenever a Bluetooth headset reconnects.
AUDIO_INPUT_NAME = "OnePlus BulletsWireless Z2 ANC"
AUDIO_INPUT_RATE = 16000

OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_SYSTEM_PROMPT = (
    "You control a Windows desktop. Map the user's spoken command to one "
    "of: open_app(name), snap_window(direction), search_google(query), "
    "search_amazon(query). Reply with just the action call, nothing else."
)

WHISPER_VOCAB_HINT = (
    "Claude, GitHub Desktop, GitHub, Visual Studio Code, WhatsApp, Chrome, "
    "Notepad, Calculator, Sticky Notes, Paint, Netflix, Microsoft Word, "
    "Microsoft Excel, Cloudflare WARP, Steam, Spotify"
)