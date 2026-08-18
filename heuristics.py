"""
Эвристики для поиска контакта админа и определения "есть ли у канала бот-каталог".

Вынесено в отдельный модуль, чтобы менять/дополнять правила распознавания,
не трогая логику работы с Telethon в parser.py.
"""

import re
from typing import List, Optional

USERNAME_RE = re.compile(r"@([A-Za-z][A-Za-z0-9_]{4,31})")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(?:\+?\d[\d\-\s()]{8,15}\d)")

# Фразы, повышающие уверенность, что рядом действительно указан контакт для связи.
COOPERATION_KEYWORDS = [
    "по вопросам сотрудничества",
    "сотрудничество",
    "реклама",
    "по всем вопросам",
    "для связи",
    "связь с админ",
    "заказ пишите",
    "менеджер",
    "администратор",
    "оптом",
    "wholesale",
    "contact",
    "заказы",
]

# Признаки того, что у канала уже есть свой бот-каталог.
BOT_KEYWORDS = [
    "бот",
    "каталог",
    "меню заказ",
    "прайс-бот",
    "магазин-бот",
    "оформить заказ через бот",
    "заказ через бота",
]

BOT_USERNAME_SUFFIX = "bot"


def extract_contact_from_text(text: str) -> Optional[str]:
    """Пытается найти контакт админа (username / email / телефон) в тексте."""
    if not text:
        return None

    emails = EMAIL_RE.findall(text)
    text_without_emails = EMAIL_RE.sub(" ", text)

    usernames = [
        u for u in USERNAME_RE.findall(text_without_emails)
        if not u.lower().endswith(BOT_USERNAME_SUFFIX)
    ]
    phones = PHONE_RE.findall(text_without_emails)

    candidates = []
    if usernames:
        candidates.append("@" + usernames[0])
    if emails:
        candidates.append(emails[0])
    if phones and not usernames and not emails:
        candidates.append(phones[0].strip())

    if not candidates:
        return None

    lowered = text.lower()
    has_cooperation_hint = any(kw in lowered for kw in COOPERATION_KEYWORDS)

    if has_cooperation_hint:
        # Несколько подсказок сразу — отдаём все, через "/"
        return " / ".join(dict.fromkeys(candidates))
    return candidates[0]


def detect_bot_flag(texts: List[str], has_inline_buttons: bool) -> bool:
    """Простая эвристика: похоже ли, что у канала уже есть рабочий бот-каталог."""
    if has_inline_buttons:
        return True

    joined = " ".join(t or "" for t in texts).lower()
    if any(kw in joined for kw in BOT_KEYWORDS):
        return True

    for username in USERNAME_RE.findall(joined):
        if username.lower().endswith(BOT_USERNAME_SUFFIX):
            return True

    return False
