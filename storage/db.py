"""
SQLite logging for command history and conversation transcript -
this is what the UI's conversation panel and command log read from.
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
