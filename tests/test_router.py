"""
Tests for the intent router - the single most fragile part of this
project. Regex patterns can silently shadow each other as the table
grows; these tests catch that immediately instead of during a live
demo.

Run: pytest
"""

from unittest.mock import patch

from intents.router import route


# Note: patches target intents.rules, not actions.apps/actions.web -
# because rules.py did "from actions.apps import open_app", the name
# open_app is bound inside intents.rules at import time. Patching
# actions.apps.open_app would leave that already-bound reference
# untouched and the test would silently do nothing.

def test_open_whatsapp_does_not_fall_through_to_search():
    with patch("intents.rules.open_app", return_value="command accepted - opening whatsapp.") as mock_open:
        route("open whatsapp")
    mock_open.assert_called_once_with("whatsapp")


def test_snap_left():
    with patch("intents.rules.snap_window", return_value="ok") as mock_snap:
        route("shift this window to the left")
    mock_snap.assert_called_once_with("left")


def test_snap_right():
    with patch("intents.rules.snap_window", return_value="ok") as mock_snap:
        route("move it to the right")
    mock_snap.assert_called_once_with("right")


def test_amazon_search_does_not_fall_through_to_google():
    with patch("intents.rules.search_amazon", return_value="ok") as mock_amazon, \
         patch("intents.rules.search_google") as mock_google:
        route("open amazon and search wireless mouse")
    mock_amazon.assert_called_once_with("wireless mouse")
    mock_google.assert_not_called()


def test_explicit_google_search():
    with patch("intents.rules.search_google", return_value="ok") as mock_google:
        route("search rtx 3050 drivers on google")
    mock_google.assert_called_once_with("rtx 3050 drivers")


def test_fallback_search_still_works():
    with patch("intents.rules.search_google", return_value="ok") as mock_google:
        route("search best gaming mouse")
    mock_google.assert_called_once_with("best gaming mouse")


def test_unrecognized_command_falls_to_llm():
    with patch("intents.router.ask_llm", return_value="ok") as mock_llm:
        route("do a backflip")
    mock_llm.assert_called_once()
