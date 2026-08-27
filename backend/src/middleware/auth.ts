import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyInitData } from "../telegram/verifyInitData";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Аутентифицирует запрос по заголовку X-Telegram-Init-Data.
 * В dev-режиме (NODE_ENV !== "production") без initData допускает
 * заголовок X-Dev-User для локальной разработки без реального Telegram.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.header("x-telegram-init-data") ?? "";
  const botToken = process.env.BOT_TOKEN ?? "";

  const tgUser = verifyInitData(initData, botToken);

  if (!tgUser) {
    if (process.env.NODE_ENV !== "production" && req.header("x-dev-user")) {
      const devId = req.header("x-dev-user")!;
      const user = await prisma.user.upsert({
        where: { telegramId: devId },
        update: {},
        create: { telegramId: devId, firstName: `Dev-${devId}` },
      });
      req.userId = user.id;
      return next();
    }
    return res.status(401).json({ error: "Не удалось подтвердить Telegram initData" });
  }

  const user = await prisma.user.upsert({
    where: { telegramId: String(tgUser.id) },
    update: {
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      photoUrl: tgUser.photo_url,
    },
    create: {
      telegramId: String(tgUser.id),
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      photoUrl: tgUser.photo_url,
    },
  });

  req.userId = user.id;
  next();
}
