import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const authorSelect = {
  select: { id: true, firstName: true, lastName: true, username: true, photoUrl: true, businessNiche: true },
};

router.get("/", async (_req, res) => {
  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: authorSelect },
  });
  res.json(vacancies);
});

router.post("/", async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  if (!user.canPostOffers) {
    return res.status(403).json({ error: "Публиковать офферы может только пользователь с разрешением от админа" });
  }

  const { title, text, contact } = req.body ?? {};
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Заголовок оффера обязателен" });
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Текст оффера обязателен" });
  }

  const vacancy = await prisma.vacancy.create({
    data: {
      title: title.trim(),
      text: text.trim(),
      contact: typeof contact === "string" && contact.trim() ? contact.trim() : null,
      authorId: req.userId!,
    },
    include: { author: authorSelect },
  });

  res.status(201).json(vacancy);
});

export default router;
