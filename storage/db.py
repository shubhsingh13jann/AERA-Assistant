"""
SQLite storage - conversation/command log, plus the app_cache table
that backs the self-learning app lookup (cache-aside pattern):
config.APPS (manual) -> app_cache (learned) -> live discovery (fallback,
writes back into app_cache so it's instant next time).
"""

import sqlite3
from datetime import datetime

DB_PATH = "signal.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS conversation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS app_cache (
            name TEXT PRIMARY KEY,
            path TEXT NOT NULL,
            learned_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def log_message(role: str, text: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO conversation (role, text, timestamp) VALUES (?, ?, ?)",
        (role, text, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def get_cached_app_path(name: str):
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT path FROM app_cache WHERE name = ?", (name.lower(),)).fetchone()
    conn.close()
    return row[0] if row else None


def cache_app_path(name: str, path: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """INSERT INTO app_cache (name, path, learned_at) VALUES (?, ?, ?)
           ON CONFLICT(name) DO UPDATE SET path=excluded.path, learned_at=excluded.learned_at""",
        (name.lower(), path, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()