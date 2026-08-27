import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const publicUserFields = {
  id: true,
  firstName: true,
  lastName: true,
  age: true,
  city: true,
  businessNiche: true,
  datingBio: true,
  datingPhotoUrl: true,
  photoUrl: true,
} as const;

// Следующая анкета для свайпа: не сам пользователь, ещё не свайпнутая, с включёнными "Знакомствами".
router.get("/next", async (req, res) => {
  const alreadySwiped = await prisma.swipe.findMany({
    where: { fromUserId: req.userId! },
    select: { toUserId: true },
  });

  const excludeIds = [req.userId!, ...alreadySwiped.map((s) => s.toUserId)];

  const candidates = await prisma.user.findMany({
    where: { datingEnabled: true, datingStatus: "APPROVED", id: { notIn: excludeIds } },
    select: publicUserFields,
    take: 25,
  });

  if (candidates.length === 0) return res.json({ candidate: null });

  const candidate = candidates[Math.floor(Math.random() * candidates.length)];
  res.json({ candidate });
});

router.post("/swipe", async (req, res) => {
  const { toUserId, direction } = req.body ?? {};

  if (!toUserId || (direction !== "LIKE" && direction !== "PASS")) {
    return res.status(400).json({ error: "toUserId и direction (LIKE|PASS) обязательны" });
  }
  if (toUserId === req.userId) {
    return res.status(400).json({ error: "Нельзя свайпнуть самого себя" });
  }

  const swipe = await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: req.userId!, toUserId } },
    update: { direction },
    create: { fromUserId: req.userId!, toUserId, direction },
  });

  let match = null;

  if (direction === "LIKE") {
    const reciprocal = await prisma.swipe.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: req.userId! } },
    });

    if (reciprocal?.direction === "LIKE") {
      const [userAId, userBId] = [req.userId!, toUserId].sort();
      match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        update: {},
        create: { userAId, userBId },
        include: {
          userA: { select: publicUserFields },
          userB: { select: publicUserFields },
        },
      });
    }
  }

  res.json({ swipe, match });
});

router.get("/matches", async (req, res) => {
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: req.userId! }, { userBId: req.userId! }] },
    include: {
      userA: { select: publicUserFields },
      userB: { select: publicUserFields },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    matches.map((m) => ({
      id: m.id,
      other: m.userAId === req.userId ? m.userB : m.userA,
      lastMessage: m.messages[0] ?? null,
      createdAt: m.createdAt,
    }))
  );
});

async function assertParticipant(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== userId && match.userBId !== userId)) return null;
  return match;
}

router.get("/matches/:id/messages", async (req, res) => {
  const match = await assertParticipant(req.params.id, req.userId!);
  if (!match) return res.status(404).json({ error: "Мэтч не найден" });

  const messages = await prisma.message.findMany({
    where: { matchId: match.id },
    orderBy: { createdAt: "asc" },
  });

  res.json(messages);
});

router.post("/matches/:id/messages", async (req, res) => {
  const match = await assertParticipant(req.params.id, req.userId!);
  if (!match) return res.status(404).json({ error: "Мэтч не найден" });

  const { text } = req.body ?? {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Текст сообщения обязателен" });
  }

  const message = await prisma.message.create({
    data: { matchId: match.id, senderId: req.userId!, text: text.trim() },
  });

  res.status(201).json(message);
});

export default router;
