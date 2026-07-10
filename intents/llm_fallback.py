"""
Fallback intent parsing via a local Ollama model, for phrasing the
regex table doesn't catch (e.g. "throw this to the side" instead of
"snap left"). Only called when the fast regex path misses - keep the
model small (llama3.2:3b / phi3:mini) so it stays responsive.

pip install ollama
"""

import ollama

SYSTEM_PROMPT = (
    "You control a Windows desktop. Map the user's spoken command to one "
    "of: open_app(name), snap_window(direction), search_google(query), "
    "search_amazon(query). Reply with just the action call, nothing else."
)


def ask_llm(text: str) -> str:
    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
    )
    action_call = response["message"]["content"].strip()
    # TODO: parse action_call and dispatch to the matching function in actions/
    return f"command accepted - {action_call}"
