import { Bot } from "grammy";

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

  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Добро пожаловать в HstlGram — соцсеть для young businessmen 🚀\n\n" +
        "Лента, знакомства и вакансии — всё внутри одного приложения.",
      webAppUrl
        ? {
            reply_markup: {
              inline_keyboard: [[{ text: "Открыть HstlGram", web_app: { url: webAppUrl } }]],
            },
          }
        : undefined
    );
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
