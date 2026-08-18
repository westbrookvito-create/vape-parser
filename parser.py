"""
Логика работы с Telegram через Telethon: получение данных о канале
(подписчики, описание, последние посты, контакт админа) и опциональный
поиск каналов по ключевым словам через Telegram Global Search.
"""

import asyncio
import logging
import re
from typing import Optional

from telethon.errors import (
    ChannelPrivateError,
    ChatAdminRequiredError,
    FloodWaitError,
    UsernameInvalidError,
    UsernameNotOccupiedError,
)
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.tl.functions.contacts import SearchRequest
from telethon.tl.types import Channel, ChannelParticipantsAdmins, User
from tqdm import tqdm

import heuristics

logger = logging.getLogger("vape_parser")


def normalize_username(raw: str) -> Optional[str]:
    """Приводит username / ссылку t.me к чистому username. Возвращает None,
    если строка пустая, закомментирована или это приватная invite-ссылка
    (её нельзя разрешить без вступления в чат)."""
    if not raw:
        return None
    raw = raw.strip()
    if not raw or raw.startswith("#"):
        return None
    raw = re.sub(r"^https?://", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"^t\.me/", "", raw, flags=re.IGNORECASE)
    raw = raw.lstrip("@")
    raw = raw.split("?")[0].strip("/")
    if not raw or raw.startswith("+") or raw.lower().startswith("joinchat"):
        return None
    return raw


async def call_with_retry(coro_func, max_retries: int = 5):
    """Выполняет coro_func() (без аргументов), автоматически ожидая
    нужное время при FloodWaitError и повторяя попытку."""
    for attempt in range(max_retries):
        try:
            return await coro_func()
        except FloodWaitError as e:
            wait_time = e.seconds + 1
            logger.warning(
                f"FloodWaitError: жду {wait_time} сек (попытка {attempt + 1}/{max_retries})"
            )
            tqdm.write(f"⏳ FloodWait: жду {wait_time} сек...")
            await asyncio.sleep(wait_time)
    raise RuntimeError("Превышено число попыток из-за постоянных FloodWaitError")


def find_linked_chat(full, linked_chat_id):
    if not linked_chat_id:
        return None
    for chat in full.chats:
        if chat.id == linked_chat_id:
            return chat
    return None


async def get_admin_contact_from_linked_chat(client, linked_entity) -> Optional[str]:
    """Пытается получить username'ы админов привязанного чата обсуждений.
    Работает только если список участников открыт для нашего аккаунта."""
    try:
        admins = await call_with_retry(
            lambda: client.get_participants(linked_entity, filter=ChannelParticipantsAdmins())
        )
    except (ChatAdminRequiredError, ChannelPrivateError):
        return None
    except Exception as e:
        logger.debug(f"Не удалось получить список админов linked-чата: {e}")
        return None

    usernames = [
        f"@{admin.username}"
        for admin in admins
        if isinstance(admin, User) and admin.username and not admin.bot
    ]
    return ", ".join(usernames[:3]) if usernames else None


async def parse_channel(client, username: str, cfg) -> Optional[dict]:
    """Собирает данные по одному каналу. Возвращает словарь, готовый для
    db.upsert_shop, либо None при ошибке (ошибка логируется отдельно)."""
    try:
        entity = await call_with_retry(lambda: client.get_entity(username))
    except (UsernameNotOccupiedError, UsernameInvalidError, ValueError):
        logger.error(f"[{username}] Канал не найден / некорректный username")
        return None
    except ChannelPrivateError:
        logger.error(f"[{username}] Канал приватный, доступ закрыт")
        return None
    except Exception as e:
        logger.error(f"[{username}] Не удалось получить сущность канала: {e}")
        return None

    if not isinstance(entity, Channel):
        logger.error(f"[{username}] Это не канал/супергруппа, пропускаю")
        return None

    try:
        full = await call_with_retry(lambda: client(GetFullChannelRequest(entity)))
    except Exception as e:
        logger.error(f"[{username}] Не удалось получить полную информацию о канале: {e}")
        return None

    about = full.full_chat.about or ""
    subscribers = full.full_chat.participants_count or 0
    title = entity.title or username
    link = f"https://t.me/{entity.username}" if entity.username else f"https://t.me/c/{entity.id}"

    texts = [about]
    has_inline_buttons = False
    last_post_date = None

    pinned_id = full.full_chat.pinned_msg_id
    if pinned_id:
        try:
            pinned = await call_with_retry(lambda: client.get_messages(entity, ids=pinned_id))
            if pinned and getattr(pinned, "message", None):
                texts.append(pinned.message)
            if pinned and getattr(pinned, "buttons", None):
                has_inline_buttons = True
        except Exception as e:
            logger.debug(f"[{username}] Не удалось получить закреплённое сообщение: {e}")

    try:
        messages = await call_with_retry(
            lambda: client.get_messages(entity, limit=cfg.MESSAGES_TO_SCAN)
        )
    except Exception as e:
        logger.error(f"[{username}] Не удалось получить последние сообщения: {e}")
        messages = []

    for i, msg in enumerate(messages):
        if msg is None:
            continue
        if i == 0:
            last_post_date = msg.date
        if msg.message:
            texts.append(msg.message)
        if msg.buttons:
            has_inline_buttons = True

    has_bot_flag = heuristics.detect_bot_flag(texts, has_inline_buttons)
    admin_contact = heuristics.extract_contact_from_text("\n".join(t for t in texts if t))

    # Если бот-каталог уже явно определён по ключевым словам/кнопкам —
    # не тратим лишний, самый дорогой по rate-limit запрос (получение
    # списка участников привязанного чата) на поиск админов.
    if not has_bot_flag and not admin_contact:
        linked_entity = find_linked_chat(full, full.full_chat.linked_chat_id)
        if linked_entity:
            admin_contact = await get_admin_contact_from_linked_chat(client, linked_entity)
            await asyncio.sleep(cfg.REQUEST_DELAY_SECONDS)

    await asyncio.sleep(cfg.REQUEST_DELAY_SECONDS)

    return {
        "username": entity.username or username,
        "title": title,
        "link": link,
        "subscribers": subscribers,
        "admin_contact": admin_contact or "не найден",
        "has_bot_flag": "возможно есть бот" if has_bot_flag else "нет бота",
        "last_post_date": last_post_date.isoformat() if last_post_date else None,
    }


async def search_channels_by_keywords(client, keywords, cfg, limit_per_keyword: int = 20):
    """Ищет публичные каналы через Telegram Global Search (contacts.search)
    по списку ключевых слов. Возвращает список username'ов без дублей."""
    found = {}
    for kw in keywords:
        try:
            result = await call_with_retry(
                lambda kw=kw: client(SearchRequest(q=kw, limit=limit_per_keyword))
            )
        except Exception as e:
            logger.error(f"[search:{kw}] Ошибка поиска: {e}")
            continue

        for chat in result.chats:
            if isinstance(chat, Channel) and chat.username:
                found[chat.username.lower()] = chat.username

        await asyncio.sleep(cfg.REQUEST_DELAY_SECONDS)

    return list(found.values())
