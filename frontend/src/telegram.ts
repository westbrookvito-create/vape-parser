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
