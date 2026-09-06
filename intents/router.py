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
    # Deterministic safety interceptors: Never let any weather or news query reach Ollama
    if any(k in text for k in ["weather", "temperature", "temp", "forecast", "climate", "how hot", "how cold", "rain", "raining", "degrees", "sunny"]):
        log.info("Directly intercepting weather query before LLM: %r", text)
        from actions.weather import get_weather
        m_city = re.search(r"\b(?:in|for|at)\s+([a-zA-Z\s]+)", text)
        city = m_city.group(1).strip() if m_city else ""
        if "tomorrow" in text:
            return get_weather(f"tomorrow in {city}" if city else "tomorrow")
        return get_weather(city)

    if any(k in text for k in ["news", "headline", "headlines", "breaking"]):
        log.info("Directly intercepting news query before LLM: %r", text)
        from actions.news import get_news
        m_topic = re.search(r"\b(?!(?:the|latest|top|today|todays|current|breaking|some|any|a|read|me)\b)([a-zA-Z0-9_-]+)\s+(?:news|headlines)\b", text)
        topic = m_topic.group(1).strip() if m_topic else "tech"
        return get_news(topic)

    # Deterministic WhatsApp interceptor
    if "whatsapp" in text and any(w in text for w in ["saying", "message", "send", "tell"]):
        m_wa = re.search(r"(?:send (?:a )?whatsapp (?:message )?to|whatsapp)\s+([a-zA-Z0-9_+]+)\s+(?:saying|that|with message)\s+(.+)", text, re.I)
        if m_wa:
            log.info("Directly intercepting WhatsApp query before LLM: %r", text)
            from actions.whatsapp import send_whatsapp
            return send_whatsapp(m_wa.group(1).strip(), m_wa.group(2).strip())

    # Deterministic Math interceptor
    is_math = (
        any(k in text for k in ["derivative of", "integral of", "differentiate", "integrate", "d/dx"]) or
        bool(re.search(r"\b\d+(?:\.\d+)?\s*(?:%|percent)\s+of\s+[\d,.]+", text)) or
        (any(k in text for k in ["calculate", "solve", "evaluate", "compute"]) and any(op in text for op in ["+", "-", "*", "/", "=", "^", "sqrt", "sin", "cos", "x"]))
    )
    if is_math:
        log.info("Directly intercepting Math query before LLM: %r", text)
        from actions.math_engine import solve_math
        return solve_math(text)

    log.info("no regex match, falling back to llm text=%r", text)
    try:
        return ask_llm(text)
    except Exception:
        log.exception("llm fallback failed - Ollama may not be running")
        return "I couldn't reach the language model for that one."