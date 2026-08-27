import { Bot, InlineKeyboard } from "grammy";
import { prisma } from "../lib/prisma";

let bot: Bot | null = null;

export function getBot(): Bot | null {
  return bot;
}

function adminTelegramIds(): string[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// chatId -> правильный ответ капчи
const pendingCaptchas = new Map<number, number>();

function buildCaptcha() {
  const a = 1 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 8);
  const answer = a + b;

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const candidate = answer + Math.floor(Math.random() * 7) - 3;
    if (candidate > 0) options.add(candidate);
  }
  const shuffled = [...options].sort(() => Math.random() - 0.5);

  const keyboard = new InlineKeyboard();
  shuffled.forEach((v, i) => {
    keyboard.text(String(v), `captcha:${v}`);
    if (i % 2 === 1) keyboard.row();
  });

  return { question: `Подтвердите, что вы не бот 🤖\n\nСколько будет ${a} + ${b}?`, answer, keyboard };
}

function welcomeKeyboard(webAppUrl?: string) {
  if (!webAppUrl) return undefined;
  return { reply_markup: { inline_keyboard: [[{ text: "Открыть HstlGram", web_app: { url: webAppUrl } }]] } };
}

const WELCOME_TEXT =
  "Добро пожаловать в HstlGram — соцсеть для young businessmen 🚀\n\n" +
  "Лента, знакомства и вакансии — всё внутри одного приложения.";

async function notifyAdminsOfNewUser(name: string, username?: string) {
  const bot = getBot();
  if (!bot) return;
  const label = `🆕 Новый пользователь HstlGram: ${name}${username ? ` (@${username})` : ""}`;
  for (const adminId of adminTelegramIds()) {
    try {
      await bot.api.sendMessage(adminId, label);
    } catch {
      // админ мог не запускать бота или заблокировал его — просто пропускаем
    }
  }
}

export function startBot() {
  const token = process.env.BOT_TOKEN;
  const webAppUrl = process.env.WEBAPP_URL;

  if (!token) {
    console.warn("BOT_TOKEN не задан — Telegram-бот не запущен.");
    return;
  }
  if (!webAppUrl) {
    console.warn("WEBAPP_URL не задан — кнопка запуска Mini App не будет работать.");
  }

  bot = new Bot(token);

  bot.command("start", async (ctx) => {
    const telegramId = String(ctx.from!.id);
    const existing = await prisma.user.findUnique({ where: { telegramId } });

    if (existing?.captchaVerified) {
      await ctx.reply(WELCOME_TEXT, welcomeKeyboard(webAppUrl));
      return;
    }

    const { question, answer, keyboard } = buildCaptcha();
    pendingCaptchas.set(ctx.chat.id, answer);
    await ctx.reply(question, { reply_markup: keyboard });
  });

  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (!data.startsWith("captcha:")) return;

    const chatId = ctx.chat!.id;
    const expected = pendingCaptchas.get(chatId);
    const chosen = Number(data.slice("captcha:".length));

    if (expected === undefined) {
      await ctx.answerCallbackQuery();
      return;
    }

    if (chosen !== expected) {
      const { question, answer, keyboard } = buildCaptcha();
      pendingCaptchas.set(chatId, answer);
      await ctx.answerCallbackQuery({ text: "Неверно, попробуйте ещё раз", show_alert: true });
      await ctx.editMessageText(question, { reply_markup: keyboard }).catch(() => {});
      return;
    }

    pendingCaptchas.delete(chatId);

    const telegramId = String(ctx.from.id);
    const existing = await prisma.user.findUnique({ where: { telegramId } });

    await prisma.user.upsert({
      where: { telegramId },
      update: { captchaVerified: true },
      create: {
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        captchaVerified: true,
      },
    });

    await ctx.answerCallbackQuery({ text: "Готово ✅" });
    await ctx.editMessageText("Проверка пройдена ✅").catch(() => {});
    await ctx.reply(WELCOME_TEXT, welcomeKeyboard(webAppUrl));

    if (!existing) {
      await notifyAdminsOfNewUser(
        [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
        ctx.from.username
      );
    }
  });

  if (webAppUrl) {
    bot.api.setChatMenuButton({
      menu_button: { type: "web_app", text: "HstlGram", web_app: { url: webAppUrl } },
    });
  }

  bot.catch((err) => console.error("Ошибка Telegram-бота:", err));

  bot.start();
  console.log("Telegram-бот запущен (long polling).");
}
