"""Central configuration - paths, constants, settings."""

APPS = {
    "whatsapp": r"shell:AppsFolder\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
    "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "vscode": r"D:\Microsoft VS Code\Code.exe",
    "netflix": r"shell:AppsFolder\4DF9E0F8.Netflix_mcm4njqhnhss8!Netflix.App",
}

WAKE_WORD = "hey signal"
TTS_RATE = 178
WHISPER_MODEL = "small.en"

OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_SYSTEM_PROMPT = (
    "You control a Windows desktop. Map the user's spoken command to one "
    "of: open_app(name), snap_window(direction), search_google(query), "
    "search_amazon(query). Reply with just the action call, nothing else."
)
