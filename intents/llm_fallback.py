"""
Conversational Brain & Agent Tool Router for Signal / JARVIS.
Features multi-turn conversation memory, witty British JARVIS persona,
direct action dispatching, and conversational intelligence.
"""

import logging
import re
import ollama

from config import OLLAMA_MODEL
from actions.apps import open_app
from actions.close import close_app
from actions.windows import snap_window
from actions.web import (
    search_google, search_amazon, search_youtube, search_spotify,
    play_youtube, play_spotify,
)
from actions.weather import get_weather
from actions.news import get_news
from actions.math_engine import solve_math
from actions.whatsapp import send_whatsapp, parse_whatsapp_command
from actions.system import (
    volume_up, volume_down, set_volume, toggle_mute, play_pause, hold_pause,
    next_track, previous_track, lock_screen,
)

log = logging.getLogger("signal")

JARVIS_SYSTEM_PROMPT = (
    "You are JARVIS, an ultra-advanced, highly capable British AI assistant controlling a Windows desktop. "
    "You serve your user with a polite, witty, concise, and sophisticated demeanor. "
    "Always address the user respectfully (e.g. 'Sir' or 'Boss'). "
    "Keep responses concise (1 to 2 sentences) because your response will be spoken aloud.\n\n"
    "REAL-TIME CAPABILITIES & ACTIONS:\n"
    "You HAVE FULL ACCESS to live real-time tools! NEVER say 'I don't have real-time access' or 'check a website/app'.\n"
    "If the user wants an action or real-time data, reply with ONLY the exact function call on line 1:\n"
    "- open_app(name)\n"
    "- close_app(name)\n"
    "- snap_window(left/right)\n"
    "- search_google(query)\n"
    "- search_amazon(query)\n"
    "- play_youtube(query)\n"
    "- play_spotify(query)\n"
    "- get_weather(location)\n"
    "- get_news(topic)\n"
    "- solve_math(query)\n"
    "- send_whatsapp(recipient, message)\n"
    "- volume_up()\n"
    "- volume_down()\n"
    "- set_volume(percent)\n"
    "- toggle_mute()\n"
    "- hold_pause()\n"
    "- next_track()\n"
    "- previous_track()\n"
    "- lock_screen()\n\n"
    "CONVERSATION & GENERAL KNOWLEDGE:\n"
    "If the user is greeting you, having a chat, or asking a general question (e.g. 'hi how are you', "
    "'who made you', 'tell me a joke', 'what is quantum computing'):\n"
    "DO NOT output an action call. Reply directly in your sophisticated JARVIS voice in 1-2 spoken sentences. "
    "Never use asterisks, emojis, or markdown bullets."
)

ACTION_MAP = {
    "open_app": open_app,
    "close_app": close_app,
    "snap_window": snap_window,
    "search_google": search_google,
    "search_amazon": search_amazon,
    "search_youtube": search_youtube,
    "search_spotify": search_spotify,
    "play_youtube": play_youtube,
    "play_spotify": play_spotify,
    "get_weather": get_weather,
    "get_news": get_news,
    "solve_math": solve_math,
    "send_whatsapp": send_whatsapp,
    "volume_up": volume_up,
    "volume_down": volume_down,
    "set_volume": set_volume,
    "toggle_mute": toggle_mute,
    "play_pause": play_pause,
    "hold_pause": hold_pause,
    "next_track": next_track,
    "previous_track": previous_track,
    "lock_screen": lock_screen,
}

CALL_PATTERN = re.compile(r'^\s*([a-zA-Z_]\w*)\s*\(\s*["\']?(.*?)["\']?\s*\)\s*$', re.DOTALL)

# Multi-turn conversation sliding memory buffer
_conversation_history = []
MAX_HISTORY_TURNS = 10


def _quick_conversational_reply(text: str):
    """Instant heuristic replies for greetings without waiting for LLM token generation."""
    t = text.lower().strip()
    if t in ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"]:
        return "Greetings, Sir. How may I be of service today?"
    if t in ["how are you", "how are you doing", "how r u", "how are you today"]:
        return "All systems are operating at peak efficiency, Sir. Thank you for asking. How can I assist you?"
    if t in ["who are you", "what are you", "what is your name"]:
        return "I am JARVIS, your on-device artificial intelligence assistant, Sir."
    if t in ["thank you", "thanks", "thanks jarvis"]:
        return "Always at your service, Sir."
    if t in ["who made you", "who created you"]:
        return "I was engineered as a private, local-first Windows intelligence system, Sir."
    return None


def ask_llm(text: str):
    """
    Main conversational agent entry point with multi-turn memory and action dispatch.
    Returns either a string or a structured card dictionary.
    """
    global _conversation_history

    t_clean = text.strip()
    t_lower = t_clean.lower()

    # 1. Instant check: If the user is asking about weather / temperature / forecast / rain
    if any(k in t_lower for k in ["weather", "temperature", "temp", "forecast", "climate", "how hot", "how cold", "rain", "raining", "degrees", "sunny"]):
        m_city = re.search(r"\b(?:in|for|at)\s+([a-zA-Z\s]+)", text, re.I)
        city = m_city.group(1).strip() if m_city else ""
        if "tomorrow" in t_lower:
            loc = f"tomorrow in {city}" if city else "tomorrow"
        else:
            loc = city
        return get_weather(loc)

    # 2. Instant check: If user is asking about news / headlines
    if any(k in t_lower for k in ["news", "headline", "headlines", "breaking"]):
        m_topic = re.search(r"\b(?!(?:the|latest|top|today|todays|current|breaking|some|any|a|read|me)\b)([a-zA-Z0-9_-]+)\s+(?:news|headlines)\b", text, re.I)
        topic = m_topic.group(1).lower() if m_topic else "tech"
        return get_news(topic)

    # 3. Instant check: WhatsApp messaging
    if "whatsapp" in t_lower or "whats app" in t_lower:
        parsed_wa = parse_whatsapp_command(text)
        if parsed_wa:
            return send_whatsapp(parsed_wa[0], parsed_wa[1])

    # 4. Instant check: Math and calculation
    is_math = (
        any(k in t_lower for k in ["derivative of", "integral of", "differentiate", "integrate", "d/dx"]) or
        bool(re.search(r"\b\d+(?:\.\d+)?\s*(?:%|percent)\s+of\s+[\d,.]+", text)) or
        (any(k in t_lower for k in ["calculate", "solve", "evaluate", "compute"]) and any(op in text for op in ["+", "-", "*", "/", "=", "^", "sqrt", "sin", "cos", "x"]))
    )
    if is_math:
        return solve_math(text)

    # 5. Check instant conversational cache first for zero-latency greetings
    quick = _quick_conversational_reply(text)
    if quick:
        _conversation_history.append({"role": "user", "content": text})
        _conversation_history.append({"role": "assistant", "content": quick})
        return quick

    try:
        messages = [{"role": "system", "content": JARVIS_SYSTEM_PROMPT}]
        # Append recent conversation turns
        for turn in _conversation_history[-MAX_HISTORY_TURNS:]:
            messages.append(turn)
        messages.append({"role": "user", "content": text})

        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=messages,
            options={"temperature": 0.3},
        )
        reply = response["message"]["content"].strip()
        log.info("Agent raw output: %r", reply)

        # Check if output is a direct function call
        match = CALL_PATTERN.match(reply)
        if match:
            func_name, arg = match.group(1), match.group(2)
            action_fn = ACTION_MAP.get(func_name)
            if action_fn:
                log.info("Dispatching agent action: %s(%r)", func_name, arg)
                # Intercept accidental open_app("wa_launcher") or open_app("whatsapp") if user asked to send a message
                if func_name == "open_app" and any(k in arg.lower() for k in ["wa", "whatsapp", "launcher"]) and any(w in t_lower for w in ["send", "saying", "message"]):
                    parsed_wa = parse_whatsapp_command(text)
                    if parsed_wa:
                        return send_whatsapp(parsed_wa[0], parsed_wa[1])

                if func_name == "send_whatsapp":
                    parts = [p.strip().strip("'\"") for p in arg.split(",", 1)]
                    if len(parts) == 2:
                        result = action_fn(parts[0], parts[1])
                    elif len(parts) == 1:
                        result = action_fn(parts[0], "Hello from JARVIS")
                    else:
                        result = action_fn("Recipient", "Hello")
                elif arg:
                    result = action_fn(arg.strip())
                else:
                    result = action_fn()

                # Add to history
                summary = result.get("speech", str(result)) if isinstance(result, dict) else str(result)
                _conversation_history.append({"role": "user", "content": text})
                _conversation_history.append({"role": "assistant", "content": summary})
                return result

        # Conversational text response
        cleaned_reply = reply.replace("*", "").replace('"', '').strip()

        # Circuit breaker: Intercept any LLM refusal regarding real-time data
        refusal_phrases = [
            "real-time access", "real time access", "knowledge cutoff", "current events",
            "access to your location", "unable to provide real-time", "weather app",
            "news website", "i don't have access", "i do not have access", "cannot provide real-time"
        ]
        if any(rp in cleaned_reply.lower() for rp in refusal_phrases):
            log.warning("Ollama refusal detected on prompt %r: %r. Intercepting with live tool!", text, cleaned_reply)
            if any(k in t_lower for k in ["weather", "temperature", "forecast", "climate", "hot", "cold", "rain", "snow"]):
                res = get_weather("tomorrow" if "tomorrow" in t_lower else "")
                _conversation_history.append({"role": "user", "content": text})
                _conversation_history.append({"role": "assistant", "content": res.get("speech", "")})
                return res
            if any(k in t_lower for k in ["news", "headline", "game", "gaming", "tech", "event", "happening"]):
                res = get_news("gaming" if any(g in t_lower for g in ["game", "gaming"]) else "tech")
                _conversation_history.append({"role": "user", "content": text})
                _conversation_history.append({"role": "assistant", "content": res.get("speech", "")})
                return res
            if "whatsapp" in t_lower or "whats app" in t_lower:
                parsed_wa = parse_whatsapp_command(text)
                if parsed_wa:
                    res = send_whatsapp(parsed_wa[0], parsed_wa[1])
                    _conversation_history.append({"role": "user", "content": text})
                    _conversation_history.append({"role": "assistant", "content": res.get("speech", "")})
                    return res
            if any(k in t_lower for k in ["derivative", "integral", "solve", "calculate", "% of"]):
                res = solve_math(text)
                _conversation_history.append({"role": "user", "content": text})
                _conversation_history.append({"role": "assistant", "content": res.get("speech", "")})
                return res
            return search_google(text)

        _conversation_history.append({"role": "user", "content": text})
        _conversation_history.append({"role": "assistant", "content": cleaned_reply})
        return cleaned_reply

    except Exception as e:
        log.exception("LLM agent encounter error: %s", e)
        fallback = "All systems operational, Sir. How else may I assist you?"
        return fallback