"""SQLite-хранилище результатов парсинга."""

import sqlite3
from datetime import datetime, timezone
from typing import Dict, List

SCHEMA = """
CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    title TEXT,
    link TEXT,
    subscribers INTEGER,
    admin_contact TEXT,
    has_bot_flag TEXT,
    last_post_date TEXT,
    parsed_at TEXT
);
"""


def get_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute(SCHEMA)
    conn.commit()
    return conn


def init_db(db_path: str) -> None:
    get_connection(db_path).close()


def channel_exists(db_path: str, username: str) -> bool:
    conn = get_connection(db_path)
    try:
        cur = conn.execute("SELECT 1 FROM shops WHERE username = ?", (username,))
        return cur.fetchone() is not None
    finally:
        conn.close()


def upsert_shop(db_path: str, data: Dict) -> None:
    """Вставляет запись о канале или обновляет её, если username уже есть.

    Дедупликация по username гарантирует, что повторный запуск
    не создаёт дублей — существующая запись просто обновляется свежими данными.
    """
    conn = get_connection(db_path)
    try:
        payload = dict(data)
        payload["parsed_at"] = datetime.now(timezone.utc).isoformat()
        conn.execute(
            """
            INSERT INTO shops (
                username, title, link, subscribers,
                admin_contact, has_bot_flag, last_post_date, parsed_at
            ) VALUES (
                :username, :title, :link, :subscribers,
                :admin_contact, :has_bot_flag, :last_post_date, :parsed_at
            )
            ON CONFLICT(username) DO UPDATE SET
                title = excluded.title,
                link = excluded.link,
                subscribers = excluded.subscribers,
                admin_contact = excluded.admin_contact,
                has_bot_flag = excluded.has_bot_flag,
                last_post_date = excluded.last_post_date,
                parsed_at = excluded.parsed_at
            """,
            payload,
        )
        conn.commit()
    finally:
        conn.close()


def get_all_shops(db_path: str) -> List[Dict]:
    conn = get_connection(db_path)
    try:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM shops ORDER BY id").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
