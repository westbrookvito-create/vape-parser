import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyInitData } from "../telegram/verifyInitData";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      isAdmin?: boolean;
    }
  }
}

function adminTelegramIds(): string[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Аутентифицирует запрос по заголовку X-Telegram-Init-Data.
 * В dev-режиме (NODE_ENV !== "production") без initData допускает
 * заголовок X-Dev-User для локальной разработки без реального Telegram.
 *
 * Telegram-аккаунты из ADMIN_TELEGRAM_IDS автоматически получают isAdmin=true
 * при каждом входе — это единственный способ назначить первого админа.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.header("x-telegram-init-data") ?? "";
  const botToken = process.env.BOT_TOKEN ?? "";

  const tgUser = verifyInitData(initData, botToken);

  if (!tgUser) {
    if (process.env.NODE_ENV !== "production" && req.header("x-dev-user")) {
      const devId = req.header("x-dev-user")!;
      const shouldBeAdmin = adminTelegramIds().includes(devId);
      const user = await prisma.user.upsert({
        where: { telegramId: devId },
        update: shouldBeAdmin ? { isAdmin: true } : {},
        create: { telegramId: devId, firstName: `Dev-${devId}`, isAdmin: shouldBeAdmin },
      });
      req.userId = user.id;
      req.isAdmin = user.isAdmin;
      return next();
    }
    return res.status(401).json({ error: "Не удалось подтвердить Telegram initData" });
  }

  const shouldBeAdmin = adminTelegramIds().includes(String(tgUser.id));

  const user = await prisma.user.upsert({
    where: { telegramId: String(tgUser.id) },
    update: {
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      photoUrl: tgUser.photo_url,
      ...(shouldBeAdmin ? { isAdmin: true } : {}),
    },
    create: {
      telegramId: String(tgUser.id),
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      photoUrl: tgUser.photo_url,
      isAdmin: shouldBeAdmin,
    },
  });

  req.userId = user.id;
  req.isAdmin = user.isAdmin;
  next();
}

/** Требует, чтобы текущий пользователь имел isAdmin=true. Ставится после requireAuth. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Доступно только администраторам" });
  }
  next();
}
