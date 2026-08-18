"""
Конфигурация парсера. Ничего секретного здесь не хардкодится —
все чувствительные значения (api_id, api_hash, номер телефона)
читаются из переменных окружения / файла .env.

Как это настроить: скопируйте .env.example в .env и заполните значения.
Подробности — в README.md.
"""

import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    # python-dotenv не обязателен, если переменные окружения
    # заданы иначе (например, экспортированы в shell или через CI).
    pass


def _get_int(name: str, default: str = "0") -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return int(default)


def _get_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


# --- Учётные данные Telegram (my.telegram.org) ---
API_ID = _get_int("TG_API_ID", "0")
API_HASH = os.getenv("TG_API_HASH", "")
PHONE = os.getenv("TG_PHONE", "")
SESSION_NAME = os.getenv("TG_SESSION_NAME", "vape_parser_session")

# --- Пути к файлам ---
DB_PATH = os.getenv("DB_PATH", "vape_shops.db")
EXPORT_PATH = os.getenv("EXPORT_PATH", "vape_shops.xlsx")
CHANNELS_FILE = os.getenv("CHANNELS_FILE", "channels.txt")
LOG_FILE = os.getenv("LOG_FILE", "parser_errors.log")

# --- Ограничение скорости запросов ---
# Пауза между обработкой каналов / запросами поиска, секунды.
REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "2.0"))

# Сколько последних сообщений канала сканировать в поисках контакта/бота.
MESSAGES_TO_SCAN = _get_int("MESSAGES_TO_SCAN", "20")

# --- Поиск каналов по ключевым словам (Telegram Global Search) ---
# Можно включить флагом --enable-search в main.py, либо здесь по умолчанию.
ENABLE_KEYWORD_SEARCH = _get_bool("ENABLE_KEYWORD_SEARCH", "false")

# Ключевые слова для поиска (используются, если не переданы через --search-keywords).
SEARCH_KEYWORDS = [
    "вейп шоп",
    "vape shop",
    "жидкости для вейпа",
    "электронные сигареты магазин",
]
