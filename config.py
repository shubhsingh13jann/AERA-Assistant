"""Central configuration - paths, constants, settings."""

APPS = {
    "whatsapp": r"shell:AppsFolder\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
    "wa_launcher": r"shell:AppsFolder\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
    "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "vscode": r"D:\Microsoft VS Code\Code.exe",
    "netflix": r"shell:AppsFolder\4DF9E0F8.Netflix_mcm4njqhnhss8!Netflix.App",
}

# Frequent WhatsApp contacts: Name (lowercase) -> Phone number with country code
# e.g., "rahul": "+919876543210"
CONTACTS = {
    "me": "",
    "myself": "",
}

# Built-in openWakeWord model used by the assistant.
WAKE_WORD = "hey_jarvis"
# The generic built-in Hey Jarvis model is a little conservative for the
# headset microphone.  Keep this above background-noise scores while allowing
# a valid phrase to wake the assistant on its first attempt.
WAKE_THRESHOLD = 0.10
TTS_RATE = 178
WHISPER_MODEL = "small.en"

# Leave this blank to follow the active Windows input device.  The selector
# then prefers a connected headset/earbuds device and falls back to the best
# available microphone.  Set a full or partial device name only to force one.
AUDIO_INPUT_NAME = ""
AUDIO_INPUT_RATE = 16000

OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_SYSTEM_PROMPT = (
    "You control a Windows desktop. Map the user's spoken command to one "
    "of: open_app(name), close_app(name), snap_window(direction), "
    "search_google(query), search_amazon(query), search_youtube(query), "
    "search_spotify(query), play_youtube(query), play_spotify(query), "
    "volume_up(), volume_down(), set_volume(percent), toggle_mute(), "
    "play_pause(), hold_pause(), next_track(), previous_track(), "
    "lock_screen(). Reply with just the action call, nothing else."
)

WHISPER_VOCAB_HINT = (
    "Claude, GitHub Desktop, GitHub, Visual Studio Code, WhatsApp, Chrome, "
    "Notepad, Calculator, Sticky Notes, Paint, Netflix, Microsoft Word, "
    "Microsoft Excel, Cloudflare WARP, Steam, Spotify"
)

# Normalize names that Whisper commonly produces before looking up an app.
# Values are the canonical cache/discovery names used by the app launcher.
APP_ALIASES = {
    "github desktop": "github",
    "git hub desktop": "github",
    "git hub": "github",
    "ms word": "word",
    "msword": "word",
    "microsoft word": "word",
    "word 2013": "word",
    "cloude": "claude",
    "cloud": "claude",
    "vs code": "visual studio code",
    "whats app": "whatsapp",
    "whats app desktop": "whatsapp",
    "whatsapp desktop": "whatsapp",
    "wa launcher": "whatsapp",
    "wa_launcher": "whatsapp",
    "wa": "whatsapp",
}
