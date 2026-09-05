"""
Live Tech, Gaming, World & Topic News Engine with rich hero images and publisher metadata.
Fetches up-to-the-minute headlines from verified feeds without API keys.
"""

import html
import logging
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

log = logging.getLogger("signal")

FEEDS = {
    "gaming": ("IGN Gaming", "https://feeds.feedburner.com/ign/all"),
    "games": ("IGN Gaming", "https://feeds.feedburner.com/ign/all"),
    "game": ("IGN Gaming", "https://feeds.feedburner.com/ign/all"),
    "tech": ("BBC Technology", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
    "technology": ("BBC Technology", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
    "world": ("BBC World News", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    "science": ("BBC Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"),
    "space": ("BBC Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"),
    "business": ("BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml"),
    "entertainment": ("BBC Entertainment", "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml"),
}

TOPIC_IMAGES = {
    "gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    "tech": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "world": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
    "science": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80",
}


def _clean_html(text: str) -> str:
    if not text:
        return ""
    unescaped = html.unescape(text)
    clean = re.sub(r"<[^>]+>", " ", unescaped)
    return " ".join(clean.split()).strip()


def get_news(topic: str = "tech") -> dict:
    """
    Fetch the latest top news headline, clean summary, publisher source,
    and high-resolution image URL. Supports gaming, tech, world, science,
    business, or any dynamic search topic.
    """
    raw_topic = (topic or "").strip()
    topic_lower = raw_topic.lower()

    # Identify matching feed
    matched_key = "tech"
    if any(g in topic_lower for g in ["game", "gaming", "esports", "playstation", "xbox", "nintendo"]):
        matched_key = "gaming"
    elif any(w in topic_lower for w in ["world", "global", "international"]):
        matched_key = "world"
    elif any(s in topic_lower for s in ["science", "space", "astronomy"]):
        matched_key = "science"
    elif any(b in topic_lower for b in ["business", "finance", "economy", "market"]):
        matched_key = "business"
    elif any(e in topic_lower for e in ["entertainment", "movie", "film", "hollywood"]):
        matched_key = "entertainment"
    elif topic_lower in FEEDS:
        matched_key = topic_lower

    if matched_key in FEEDS:
        source_name, feed_url = FEEDS[matched_key]
    else:
        # Dynamic search via Google News RSS
        source_name = f"Google News ({raw_topic.title()})"
        query = urllib.parse.quote(f"{raw_topic} news")
        feed_url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"

    try:
        req = urllib.request.Request(
            feed_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SignalAssistant/2.0"},
        )
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            xml_data = resp.read()

        root = ET.fromstring(xml_data)
        items = root.findall("./channel/item")

        if not items:
            raise ValueError("No news items found in feed")

        top_item = items[0]
        raw_title = top_item.find("title").text if top_item.find("title") is not None else f"Latest {matched_key.title()} News"
        raw_desc = top_item.find("description").text if top_item.find("description") is not None else ""
        link = top_item.find("link").text if top_item.find("link") is not None else "https://news.google.com"
        pub_date = top_item.find("pubDate").text if top_item.find("pubDate") is not None else "Just Now"

        # If item has its own source element (like Google News RSS)
        source_elem = top_item.find("source")
        if source_elem is not None and source_elem.text:
            source_name = source_elem.text.strip()

        title = _clean_html(raw_title)
        summary = _clean_html(raw_desc)
        if not summary or summary == title:
            summary = "Reporting on the latest developments, innovations, and breaking events in this space."

        # Extract image URL
        image_url = None

        # 1. Enclosure check
        for enc in top_item.findall("enclosure"):
            if "url" in enc.attrib:
                image_url = enc.attrib["url"]
                break

        # 2. Media content & thumbnail check
        if not image_url:
            for child in top_item:
                if ("content" in child.tag or "thumbnail" in child.tag) and "url" in child.attrib:
                    image_url = child.attrib["url"]
                    break

        # 3. HTML description img src check
        if not image_url and raw_desc:
            match = re.search(r'src=["\'](https?://[^"\']+\.(?:jpg|jpeg|png|webp)[^"\']*)["\']', raw_desc, re.I)
            if match:
                image_url = match.group(1)

        # Upgrade BBC thumbnail resolution from 240 to 800
        if image_url and "/240/" in image_url:
            image_url = image_url.replace("/240/", "/800/")

        if not image_url:
            image_url = TOPIC_IMAGES.get(matched_key, TOPIC_IMAGES["tech"])

        speech = f"Here is the latest {matched_key} headline from {source_name}, Sir: {title}. {summary}"

        return {
            "speech": speech,
            "text": f"[{source_name.upper()}] {title} — {summary}",
            "card": {
                "type": "news",
                "data": {
                    "title": title,
                    "summary": summary,
                    "source": source_name,
                    "url": link,
                    "image": image_url,
                    "category": matched_key.upper(),
                    "time": pub_date,
                },
            },
        }

    except Exception as e:
        log.exception("Failed to fetch news feed for %r: %s", topic, e)
        fallback_speech = f"I am unable to retrieve the latest {matched_key} headlines at the moment, Sir."
        return {
            "speech": fallback_speech,
            "text": fallback_speech,
            "card": None,
        }
