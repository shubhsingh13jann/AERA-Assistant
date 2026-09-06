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


def test_open_multi_word_app_does_not_fall_back_to_llm():
    with patch("intents.rules.open_app", return_value="ok") as mock_open, \
         patch("intents.router.ask_llm") as mock_llm:
        route("open github desktop")
    mock_open.assert_called_once_with("github desktop")
    mock_llm.assert_not_called()


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


def test_youtube_open_and_play():
    with patch("intents.rules.play_youtube", return_value={"speech": "ok"}) as mock_play:
        route("open youtube and play hanuman chalisa")
    mock_play.assert_called_once_with("hanuman chalisa")


def test_weather_route():
    with patch("intents.rules.get_weather", return_value={"speech": "ok"}) as mock_weather:
        route("what is the weather in tokyo")
    mock_weather.assert_called_once_with("tokyo")


def test_temperature_tomorrow():
    with patch("intents.rules.get_weather", return_value={"speech": "ok"}) as mock_weather:
        route("what will be the temperature tomorrow")
    mock_weather.assert_called_once_with("tomorrow")


def test_news_route():
    with patch("intents.rules.get_news", return_value={"speech": "ok"}) as mock_news:
        route("tell me the latest tech news today")
    mock_news.assert_called_once_with("tech")


def test_gaming_news_route():
    with patch("intents.rules.get_news", return_value={"speech": "ok"}) as mock_news:
        route("Tell me the latest gaming news")
    mock_news.assert_called_once_with("gaming")


def test_temperature_today():
    with patch("intents.rules.get_weather", return_value={"speech": "ok"}) as mock_weather:
        route("what is the temperature today")
    mock_weather.assert_called_once_with("")


def test_is_it_hot_outside():
    with patch("intents.rules.get_weather", return_value={"speech": "ok"}) as mock_weather:
        route("is it hot outside")
    mock_weather.assert_called_once_with("")


def test_will_it_rain_tomorrow():
    with patch("intents.rules.get_weather", return_value={"speech": "ok"}) as mock_weather:
        route("will it rain tomorrow")
    mock_weather.assert_called_once_with("tomorrow")


def test_headlines_route():
    with patch("intents.rules.get_news", return_value={"speech": "ok"}) as mock_news:
        route("tell me the headlines")
    mock_news.assert_called_once_with("tech")


def test_read_me_the_news():
    with patch("intents.rules.get_news", return_value={"speech": "ok"}) as mock_news:
        route("read me the news")
    mock_news.assert_called_once_with("tech")


def test_llm_refusal_circuit_breaker():
    from intents.llm_fallback import ask_llm
    with patch("ollama.chat", return_value={"message": {"content": "I'm afraid I don't have real-time access to current events, Sir."}}), \
         patch("intents.llm_fallback.get_news", return_value={"speech": "Live news fetched"}) as mock_get_news:
        result = ask_llm("what is happening in world events today")
    # Circuit breaker must intercept the canned refusal and return live news
    assert result == {"speech": "Live news fetched"}
    mock_get_news.assert_called_once()


def test_math_percentage_route():
    with patch("intents.rules.solve_math", return_value={"speech": "ok"}) as mock_math:
        route("what is 45% of 18500")
    mock_math.assert_called_once()


def test_math_calculus_route():
    with patch("intents.rules.solve_math", return_value={"speech": "ok"}) as mock_math:
        route("derivative of x^3 * sin(x)")
    mock_math.assert_called_once()


def test_whatsapp_route():
    with patch("intents.rules.send_whatsapp", return_value={"speech": "ok"}) as mock_wa:
        route("send a whatsapp message to Rahul saying I will reach in 10 minutes")
    mock_wa.assert_called_once_with("rahul", "i will reach in 10 minutes")
