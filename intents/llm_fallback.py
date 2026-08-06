"""
Fallback intent parsing via a local Ollama model, for phrasing the
regex table doesn't catch. Only called when the fast regex path
misses.

Critically: the model only decides WHICH action to call - it never
touches the OS directly. This function parses its proposed call and
dispatches to the same real action functions the regex path uses.
"""

import re
import logging

import ollama

from config import OLLAMA_MODEL, OLLAMA_SYSTEM_PROMPT
from actions.apps import open_app
from actions.close import close_app
from actions.windows import snap_window
from actions.web import search_google, search_amazon, search_youtube, search_spotify

log = logging.getLogger("signal")

ACTION_MAP = {
    "open_app": open_app,
    "close_app": close_app,
    "snap_window": snap_window,
    "search_google": search_google,
    "search_amazon": search_amazon,
    "search_youtube": search_youtube,
    "search_spotify": search_spotify,
}

CALL_PATTERN = re.compile(r'(\w+)\(\s*["\']?(.*?)["\']?\s*\)')


def ask_llm(text: str) -> str:
    response = ollama.chat(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": OLLAMA_SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
    )
    action_call = response["message"]["content"].strip()
    log.info("llm proposed: %s", action_call)

    match = CALL_PATTERN.match(action_call)
    if not match:
        return "I couldn't work out what to do with that."

    func_name, arg = match.group(1), match.group(2)
    action_fn = ACTION_MAP.get(func_name)
    if not action_fn:
        return f"I don't have an action called {func_name}."

    try:
        return action_fn(arg.lower().strip())
    except Exception:
        log.exception("action dispatch failed for %s(%r)", func_name, arg)
        return "something went wrong carrying that out."