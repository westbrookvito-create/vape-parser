"""
Точка входа. Пример использования — см. README.md.

    python main.py --channels-file channels.txt
    python main.py --channels vapeshop1,vapeshop2
    python main.py --enable-search
    python main.py --export-only
"""

import argparse
import asyncio
import logging

from telethon import TelegramClient
from tqdm import tqdm

import config
import db
import exporter
import parser as ch_parser


def setup_logging() -> None:
    logging.basicConfig(
        filename=config.LOG_FILE,
        level=logging.WARNING,
        format="%(asctime)s [%(levelname)s] %(message)s",
        encoding="utf-8",
    )


def load_channels_from_file(path: str):
    channels = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                channels.append(line)
    except FileNotFoundError:
        print(f"Файл {path} не найден, пропускаю.")
    return channels


def parse_args():
    p = argparse.ArgumentParser(description="Парсер Telegram-каналов вейп-шопов")
    p.add_argument("--channels-file", default=None, help="Путь к файлу со списком каналов")
    p.add_argument("--channels", default=None, help="Каналы через запятую (username или t.me/...)")
    p.add_argument("--enable-search", action="store_true", help="Включить поиск по ключевым словам")
    p.add_argument(
        "--search-keywords",
        default=None,
        help="Ключевые слова через запятую (переопределяет config.SEARCH_KEYWORDS)",
    )
    p.add_argument(
        "--export-only",
        action="store_true",
        help="Только экспортировать текущую БД в Excel, без запуска парсинга",
    )
    return p.parse_args()


async def run(args) -> None:
    db.init_db(config.DB_PATH)

    if args.export_only:
        path = exporter.export_to_excel(config.DB_PATH, config.EXPORT_PATH)
        print(f"Экспортировано в {path}")
        return

    channels = []
    if args.channels:
        channels.extend([c.strip() for c in args.channels.split(",") if c.strip()])
    else:
        channels.extend(load_channels_from_file(args.channels_file or config.CHANNELS_FILE))

    client = TelegramClient(config.SESSION_NAME, config.API_ID, config.API_HASH)
    await client.start(phone=config.PHONE)
    print("Авторизация в Telegram успешна.")

    if args.enable_search or config.ENABLE_KEYWORD_SEARCH:
        keywords = (
            [k.strip() for k in args.search_keywords.split(",") if k.strip()]
            if args.search_keywords
            else config.SEARCH_KEYWORDS
        )
        print(f"Поиск каналов по ключевым словам: {keywords}")
        found = await ch_parser.search_channels_by_keywords(client, keywords, config)
        print(f"Найдено {len(found)} каналов через поиск.")
        channels.extend(found)

    seen = set()
    unique_channels = []
    for c in channels:
        norm = ch_parser.normalize_username(c)
        if norm and norm.lower() not in seen:
            seen.add(norm.lower())
            unique_channels.append(norm)

    if not unique_channels:
        print(
            "Список каналов пуст. Укажите --channels-file / channels.txt, "
            "--channels или включите --enable-search."
        )
        await client.disconnect()
        return

    stats = {"total": len(unique_channels), "processed": 0, "errors": 0, "no_bot_leads": 0}

    for username in tqdm(unique_channels, desc="Парсинг каналов", unit="канал"):
        try:
            result = await ch_parser.parse_channel(client, username, config)
        except Exception as e:
            logging.getLogger("vape_parser").error(f"[{username}] Неожиданная ошибка: {e}")
            stats["errors"] += 1
            continue

        if result is None:
            stats["errors"] += 1
            continue

        db.upsert_shop(config.DB_PATH, result)
        stats["processed"] += 1
        if result["has_bot_flag"] == "нет бота":
            stats["no_bot_leads"] += 1

    await client.disconnect()

    export_path = exporter.export_to_excel(config.DB_PATH, config.EXPORT_PATH)

    print("\n=== Итоги ===")
    print(f"Всего каналов в списке: {stats['total']}")
    print(f"Успешно обработано: {stats['processed']}")
    print(f"Ошибок/пропущено: {stats['errors']}")
    print(f"Каналов без признаков бота (целевые лиды): {stats['no_bot_leads']}")
    print(f"Подробный лог ошибок: {config.LOG_FILE}")
    print(f"Экспорт: {export_path}")


def main() -> None:
    setup_logging()
    args = parse_args()
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
