"""
Matches transcribed text against the regex intent table first (fast
path, near-zero latency). Falls back to the local Ollama model only
when nothing matches - for natural phrasing the regex table can't catch.
"""

import logging

from intents.rules import INTENTS
from intents.llm_fallback import ask_llm

log = logging.getLogger("signal")


def route(text: str) -> str:
    text = text.lower().strip()
    for intent in INTENTS:
        match = intent.pattern.search(text)
        if match:
            log.info("matched intent=%s text=%r", intent.name, text)
            return intent.handler(match)
    log.info("no regex match, falling back to llm text=%r", text)
    return ask_llm(text)
