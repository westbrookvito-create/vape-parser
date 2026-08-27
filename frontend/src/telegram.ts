export function getTelegram(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function getInitData(): string {
  return getTelegram()?.initData ?? "";
}

export function initTelegram() {
  const tg = getTelegram();
  if (!tg) return;
  tg.ready();
  tg.expand();
  applyThemeVars(tg.themeParams);
}

function applyThemeVars(theme: Record<string, string>) {
  const root = document.documentElement.style;
  if (theme.bg_color) root.setProperty("--tg-bg", `#${theme.bg_color}`);
  if (theme.text_color) root.setProperty("--tg-text", `#${theme.text_color}`);
  if (theme.hint_color) root.setProperty("--tg-hint", `#${theme.hint_color}`);
  if (theme.button_color) root.setProperty("--tg-accent", `#${theme.button_color}`);
  if (theme.secondary_bg_color) root.setProperty("--tg-secondary-bg", `#${theme.secondary_bg_color}`);
}

export function haptic(style: "light" | "medium" | "heavy" = "light") {
  getTelegram()?.HapticFeedback?.impactOccurred(style);
}

export const ADMIN_CONTACT_USERNAME = "saintsoon";

/** Открывает чат по username — внутри Telegram нативно, в браузере — новой вкладкой. */
function openTelegramChat(username: string) {
  const url = `https://t.me/${username}`;
  const tg = getTelegram();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

/** Открывает чат с админом (@saintsoon). */
export function openAdminChat() {
  openTelegramChat(ADMIN_CONTACT_USERNAME);
}

/** Открывает чат с самим ботом HstlGram — там проходит антибот-капча (/start). */
export function openBotChat() {
  const username = import.meta.env.VITE_BOT_USERNAME;
  if (!username) {
    console.warn("VITE_BOT_USERNAME не задан — не могу открыть чат с ботом");
    return;
  }
  openTelegramChat(username);
}
