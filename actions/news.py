"""
Live Tech & World News Engine with rich hero images and publisher metadata.
Fetches up-to-the-minute headlines from verified feeds without API keys.
"""

import html
import logging
import re
import urllib.request
import xml.etree.ElementTree as ET

log = logging.getLogger("signal")

FEEDS = {
    "tech": ("BBC Technology", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
    "world": ("BBC World News", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    "science": ("BBC Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"),
}

DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"


def _clean_html(text: str) -> str:
    if not text:
        return ""
    unescaped = html.unescape(text)
    clean = re.sub(r"<[^>]+>", " ", unescaped)
    return " ".join(clean.split()).strip()


def get_news(topic: str = "tech") -> dict:
    """
    Fetch the latest top news headline, clean summary, publisher source,
    and high-resolution image URL. Returns speech text + structured card payload.
    """
    topic_key = "tech"
    topic_lower = (topic or "").lower()
    if "world" in topic_lower or "global" in topic_lower:
        topic_key = "world"
    elif "science" in topic_lower or "space" in topic_lower:
        topic_key = "science"

    source_name, feed_url = FEEDS.get(topic_key, FEEDS["tech"])

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
        raw_title = top_item.find("title").text if top_item.find("title") is not None else "Breaking Technology Update"
        raw_desc = top_item.find("description").text if top_item.find("description") is not None else ""
        link = top_item.find("link").text if top_item.find("link") is not None else "https://news.google.com"
        pub_date = top_item.find("pubDate").text if top_item.find("pubDate") is not None else "Just Now"

        title = _clean_html(raw_title)
        summary = _clean_html(raw_desc)

        # Extract image URL
        image_url = None
        # Check media:thumbnail
        for child in top_item:
            if "thumbnail" in child.tag and "url" in child.attrib:
                image_url = child.attrib["url"]
                break
            if "content" in child.tag and "url" in child.attrib:
                image_url = child.attrib["url"]
                break

        # If found BBC thumbnail, upgrade to high-res (replace /240/ with /800/)
        if image_url and "/240/" in image_url:
            image_url = image_url.replace("/240/", "/800/")

        if not image_url:
            image_url = DEFAULT_FALLBACK_IMAGE

        speech = f"Here is the latest {topic_key} headline from {source_name}, Sir: {title}. {summary}"

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
                    "category": topic_key.upper(),
                    "time": pub_date,
                },
            },
        }

    except Exception as e:
        log.exception("Failed to fetch news feed: %s", e)
        fallback_speech = "I am unable to retrieve the latest news headlines at the moment, Sir."
        return {
            "speech": fallback_speech,
            "text": fallback_speech,
            "card": None,
        }

