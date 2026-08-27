# HstlGram

Telegram Mini App — соцсеть для young businessmen. Дизайн ленты вдохновлён Threads,
механика знакомств — свайп-карточки в духе Дайвинчика (лайк/пропуск → мэтч → чат).
Вкладка «Вакансии» пока заглушка «Скоро будет».

## Структура

```
backend/    Node.js + Express + PostgreSQL (Prisma) + Telegram-бот (grammy)
frontend/   React + Vite + TypeScript, Telegram WebApp SDK
```

### Вкладки Mini App

- **Лента** — посты, лайки, комментарии.
- **Знакомства** — свайп анкет (лайк/пропуск), при взаимном лайке — мэтч и чат.
- **Вакансии** — заглушка «Скоро будет».
- **Профиль** — данные пользователя, включение участия в «Знакомствах».

## Как это работает

1. Пользователь открывает бота в Telegram, нажимает кнопку меню/`/start` → открывается Mini App.
2. Frontend получает `Telegram.WebApp.initData` и отправляет его в заголовке
   `X-Telegram-Init-Data` с каждым запросом к API.
3. Backend проверяет подпись `initData` секретом бота (`BOT_TOKEN`) и создаёт/находит
   пользователя в БД — отдельная авторизация (логин/пароль) не нужна.

## Запуск локально

### 1. PostgreSQL

Поднимите локальный Postgres (Docker пример):

```bash
docker run --name hstlgram-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hstlgram -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # заполните BOT_TOKEN, DATABASE_URL, WEBAPP_URL
npm install
npm run prisma:migrate # создаст таблицы
npm run dev            # http://localhost:3000
```

`BOT_TOKEN` берётся у [@BotFather](https://t.me/BotFather) (`/newbot`).
Пока Mini App не задеплоен, `WEBAPP_URL` можно оставить пустым — бот запустится,
просто кнопка запуска приложения в Telegram работать не будет.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev             # http://localhost:5173
```

### 4. Разработка вне Telegram

Внутри Telegram `window.Telegram.WebApp.initData` доступен автоматически.
Для локальной разработки в обычном браузере (без Telegram) backend поддерживает
dev-обход: заполните `VITE_DEV_USER_ID` в `frontend/.env` любым значением
(например `123`) — фронтенд начнёт слать заголовок `X-Dev-User`, и backend создаст
тестового пользователя. Работает только при `NODE_ENV !== "production"`.

## Деплой

1. **Backend**: любой Node-хостинг (Railway, Render, VPS + PM2/Docker) + managed PostgreSQL.
   Задайте `BOT_TOKEN`, `DATABASE_URL`, `WEBAPP_URL` (адрес задеплоенного фронтенда),
   `CORS_ORIGIN`. Примените миграции (`npm run prisma:migrate`) и `npm run build && npm start`.
2. **Frontend**: статический хостинг (Vercel/Netlify/Cloudflare Pages), обязательно **HTTPS**
   (требование Telegram Mini Apps). Задайте `VITE_API_URL` = адрес backend `/api`.
3. В [@BotFather](https://t.me/BotFather): `/mybots` → бот → **Bot Settings → Menu Button**
   → укажите URL задеплоенного фронтенда (или это делает сам бот через `setChatMenuButton`
   при старте, если `WEBAPP_URL` задан).

## Что дальше (не входит в MVP)

- Загрузка фото (сейчас — по прямой ссылке URL) — нужен объектный storage (S3/Cloudflare R2).
- Realtime-чат через WebSocket/Socket.io вместо поллинга каждые 3с.
- Модерация контента ленты и анкет знакомств.
- Наполнение раздела «Вакансии».
