import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getBot } from "../telegram/bot";

const router = Router();

const publicUserFields = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  age: true,
  city: true,
  businessNiche: true,
  datingBio: true,
  datingPhotoUrl: true,
  photoUrl: true,
} as const;

// --- Знакомства: модерация анкет ---

router.get("/dating/pending", async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { datingStatus: "PENDING" },
    select: { ...publicUserFields, updatedAt: true },
    orderBy: { updatedAt: "asc" },
  });
  res.json(users);
});

router.post("/dating/:userId/approve", async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: { datingStatus: "APPROVED", datingRejectionReason: null },
  });
  res.json(user);
});

router.post("/dating/:userId/reject", async (req, res) => {
  const { reason } = req.body ?? {};
  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: {
      datingStatus: "REJECTED",
      datingEnabled: false,
      datingRejectionReason: typeof reason === "string" && reason.trim() ? reason.trim() : "Анкета отклонена админом",
    },
  });
  res.json(user);
});

// Полностью удаляет анкету знакомств (в отличие от отклонения — без причины, сразу очищает данные)
router.delete("/dating/:userId", async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: {
      datingEnabled: false,
      datingBio: null,
      datingPhotoUrl: null,
      datingStatus: "NONE",
      datingRejectionReason: null,
    },
  });
  res.json(user);
});

// --- Офферы: заявки на право публикации ---

router.get("/offer-requests", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "PENDING";
  const requests = await prisma.offerPermissionRequest.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: { user: { select: publicUserFields } },
    orderBy: { createdAt: "asc" },
  });
  res.json(requests);
});

router.post("/offer-requests/:id/approve", async (req, res) => {
  const request = await prisma.offerPermissionRequest.findUniqueOrThrow({ where: { id: req.params.id } });
  await prisma.$transaction([
    prisma.offerPermissionRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    }),
    prisma.user.update({ where: { id: request.userId }, data: { canPostOffers: true } }),
  ]);
  res.json({ ok: true });
});

router.post("/offer-requests/:id/reject", async (req, res) => {
  const request = await prisma.offerPermissionRequest.update({
    where: { id: req.params.id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  res.json(request);
});

// --- Вакансии: базовая модерация контента ---

router.get("/vacancies", async (_req, res) => {
  const vacancies = await prisma.vacancy.findMany({
    include: { author: { select: publicUserFields } },
    orderBy: { createdAt: "desc" },
  });
  res.json(vacancies);
});

router.delete("/vacancies/:id", async (req, res) => {
  await prisma.vacancy.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// --- Пользователи: ручное управление правами ---

router.get("/users", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      ...publicUserFields,
      isAdmin: true,
      canPostOffers: true,
      datingStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json(users);
});

router.post("/users/:id/offer-permission", async (req, res) => {
  const { canPostOffers } = req.body ?? {};
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { canPostOffers: Boolean(canPostOffers) },
  });
  res.json(user);
});

router.post("/users/:id/admin", async (req, res) => {
  if (req.params.id === req.userId) {
    return res.status(400).json({ error: "Нельзя изменить права администратора самому себе" });
  }
  const { isAdmin } = req.body ?? {};
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isAdmin: Boolean(isAdmin) },
  });
  res.json(user);
});

// --- Рассылка всем пользователям бота ---

router.post("/broadcast", async (req, res) => {
  const { text } = req.body ?? {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Текст рассылки обязателен" });
  }

  const bot = getBot();
  if (!bot) {
    return res.status(400).json({ error: "Telegram-бот не запущен (не задан BOT_TOKEN)" });
  }

  const users = await prisma.user.findMany({ select: { telegramId: true } });

  let sent = 0;
  let failed = 0;
  for (const u of users) {
    try {
      await bot.api.sendMessage(u.telegramId, text.trim());
      sent++;
    } catch {
      failed++;
    }
    // не более ~25 сообщений/сек, чтобы не упереться в лимиты Telegram
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  res.json({ total: users.length, sent, failed });
});

export default router;
