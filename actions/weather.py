"""
Real-time Weather & Forecast Engine using Open-Meteo & IP-API.
Completely free, no API keys required, works globally.
"""

import json
import logging
import urllib.parse
import urllib.request
from datetime import datetime

log = logging.getLogger("signal")

WMO_CODE_MAP = {
    0: ("Clear Sky", "sun"),
    1: ("Mainly Clear", "sun"),
    2: ("Partly Cloudy", "cloud-sun"),
    3: ("Overcast", "cloud"),
    45: ("Foggy", "cloud-fog"),
    48: ("Depositing Rime Fog", "cloud-fog"),
    51: ("Light Drizzle", "cloud-drizzle"),
    53: ("Moderate Drizzle", "cloud-drizzle"),
    55: ("Dense Drizzle", "cloud-drizzle"),
    61: ("Slight Rain", "cloud-rain"),
    63: ("Moderate Rain", "cloud-rain"),
    65: ("Heavy Rain", "cloud-rain"),
    71: ("Slight Snow", "snowflake"),
    73: ("Moderate Snow", "snowflake"),
    75: ("Heavy Snow", "snowflake"),
    80: ("Slight Rain Showers", "cloud-rain"),
    81: ("Moderate Rain Showers", "cloud-rain"),
    82: ("Violent Rain Showers", "cloud-lightning"),
    95: ("Thunderstorm", "cloud-lightning"),
    96: ("Thunderstorm with Slight Hail", "cloud-lightning"),
    99: ("Thunderstorm with Heavy Hail", "cloud-lightning"),
}


def _get_current_location():
    """Detect city, country, and lat/lon based on user IP."""
    try:
        url = "http://ip-api.com/json/?fields=status,city,country,lat,lon"
        req = urllib.request.Request(url, headers={"User-Agent": "SignalAssistant/2.0"})
        with urllib.request.urlopen(req, timeout=3.5) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success":
                return data.get("city", "Bengaluru"), data.get("country", "India"), data["lat"], data["lon"]
    except Exception as e:
        log.warning("IP geolocation failed: %s", e)
    # Default fallback
    return "Bengaluru", "India", 12.9753, 77.591


def _geocode_city(city_name: str):
    """Geocode a city name into lat/lon via Open-Meteo Geocoding API."""
    try:
        query = urllib.parse.quote(city_name.strip())
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=1&language=en&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "SignalAssistant/2.0"})
        with urllib.request.urlopen(req, timeout=4.0) as response:
            data = json.loads(response.read().decode("utf-8"))
            results = data.get("results")
            if results and len(results) > 0:
                top = results[0]
                return top.get("name", city_name), top.get("country", ""), top["latitude"], top["longitude"]
    except Exception as e:
        log.warning("Geocoding failed for %r: %s", city_name, e)
    return None


def get_weather(location: str = "") -> dict:
    """
    Fetch live weather and return speech text + structured card metadata.
    """
    location_clean = (location or "").strip()
    is_tomorrow = "tomorrow" in location_clean.lower()
    # Normalize common phrases
    for stop in ["today", "now", "here", "current", "outside", "weather", "forecast", "tomorrow"]:
        if location_clean.lower() == stop:
            location_clean = ""

    if location_clean:
        geo = _geocode_city(location_clean)
        if geo:
            city, country, lat, lon = geo
        else:
            city, country, lat, lon = _get_current_location()
    else:
        city, country, lat, lon = _get_current_location()

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            f"&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "SignalAssistant/2.0"})
        with urllib.request.urlopen(req, timeout=4.5) as response:
            res = json.loads(response.read().decode("utf-8"))

        current = res.get("current_weather", {})
        temp = round(current.get("temperature", 24))
        wind = round(current.get("windspeed", 10))
        code = current.get("weathercode", 0)
        cond_text, icon = WMO_CODE_MAP.get(code, ("Clear", "sun"))

        daily = res.get("daily", {})
        max_temps = daily.get("temperature_2m_max", [temp])
        min_temps = daily.get("temperature_2m_min", [temp - 5])
        dates = daily.get("time", [])
        codes = daily.get("weathercode", [])

        high = round(max_temps[0]) if max_temps else temp
        low = round(min_temps[0]) if min_temps else temp - 5

        # 3-day forecast list
        forecast_items = []
        for i in range(min(3, len(dates))):
            d_name = "Today" if i == 0 else "Tomorrow" if i == 1 else datetime.strptime(dates[i], "%Y-%m-%d").strftime("%a")
            d_cond, d_icon = WMO_CODE_MAP.get(codes[i] if i < len(codes) else 0, ("Clear", "sun"))
            forecast_items.append({
                "day": d_name,
                "high": round(max_temps[i]) if i < len(max_temps) else temp,
                "low": round(min_temps[i]) if i < len(min_temps) else temp - 5,
                "condition": d_cond,
                "icon": d_icon,
            })

        if is_tomorrow and len(forecast_items) > 1:
            tom = forecast_items[1]
            speech = (
                f"Tomorrow in {city}, the temperature will reach a high of {tom['high']} degrees Celsius "
                f"and a low of {tom['low']} degrees with {tom['condition'].lower()}, Sir."
            )
            text_summary = f"Tomorrow in {city}: High {tom['high']}°C, Low {tom['low']}°C, {tom['condition']}."
        else:
            speech = (
                f"Currently in {city}, it's {temp} degrees Celsius with {cond_text.lower()}, "
                f"reaching a high of {high} degrees today with winds at {wind} kilometers per hour, Sir."
            )
            text_summary = f"Weather in {city}: {temp}°C, {cond_text}. High: {high}°C, Low: {low}°C, Wind: {wind} km/h."

        return {
            "speech": speech,
            "text": text_summary,
            "card": {
                "type": "weather",
                "data": {
                    "city": city,
                    "country": country,
                    "temp": temp,
                    "condition": cond_text,
                    "icon": icon,
                    "wind": wind,
                    "high": high,
                    "low": low,
                    "forecast": forecast_items,
                },
            },
        }

    except Exception as e:
        log.exception("Failed to fetch weather telemetry: %s", e)
        fallback_speech = "I am unable to retrieve live meteorological telemetry at this moment, Sir."
        return {
            "speech": fallback_speech,
            "text": fallback_speech,
            "card": None,
        }
