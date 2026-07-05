import sqlite3
from datetime import datetime

import os
DB_PATH = os.environ.get("DB_PATH", os.path.join(os.sep, "tmp", "marketpulse.db"))


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS price_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            price REAL NOT NULL,
            volume INTEGER NOT NULL,
            change_percent REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_ticker_timestamp
        ON price_cache (ticker, timestamp)
    """)
    conn.commit()
    conn.close()


def insert_price_record(ticker: str, price: float, volume: int, change_percent: float):
    conn = get_connection()
    conn.execute(
        "INSERT INTO price_cache (ticker, price, volume, change_percent, timestamp) VALUES (?, ?, ?, ?, ?)",
        (ticker.upper(), price, volume, change_percent, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def get_recent_records(ticker: str, limit: int = 100) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM price_cache WHERE ticker = ? ORDER BY timestamp DESC LIMIT ?",
        (ticker.upper(), limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
