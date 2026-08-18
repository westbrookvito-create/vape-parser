"""Экспорт результатов из SQLite в Excel."""

import pandas as pd
from openpyxl.utils import get_column_letter

import db

COLUMNS_MAP = {
    "title": "Название",
    "link": "Ссылка",
    "subscribers": "Подписчики",
    "admin_contact": "Контакт админа",
    "has_bot_flag": "Есть бот?",
    "last_post_date": "Последний пост",
}


def export_to_excel(db_path: str, output_path: str) -> str:
    rows = db.get_all_shops(db_path)

    if rows:
        df = pd.DataFrame(rows)[list(COLUMNS_MAP.keys())].rename(columns=COLUMNS_MAP)
    else:
        df = pd.DataFrame(columns=list(COLUMNS_MAP.values()))

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Shops")
        worksheet = writer.sheets["Shops"]
        for i, col in enumerate(df.columns, start=1):
            values = [str(col)] + [str(v) for v in df[col].tolist()]
            width = min(max(len(v) for v in values) + 2, 60)
            worksheet.column_dimensions[get_column_letter(i)].width = width

    return output_path
