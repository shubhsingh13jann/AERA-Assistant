"""
Matches transcribed text against the regex intent table first (fast
path, near-zero latency). Falls back to the local Ollama model only
when nothing matches - for natural phrasing the regex table can't catch.
"""

import re
import logging

from intents.rules import INTENTS
from intents.llm_fallback import ask_llm

log = logging.getLogger("signal")


def route(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[.,!?]+$", "", text).strip()  # whisper adds trailing punctuation
    for intent in INTENTS:
        match = intent.pattern.search(text)
        if match:
            log.info("matched intent=%s text=%r", intent.name, text)
            return intent.handler(match)
        
    log.info("no regex match, falling back to llm text=%r", text)
    try:
        return ask_llm(text)
    except Exception:
        log.exception("llm fallback failed - Ollama may not be running")
        return "I couldn't reach the language model for that one."