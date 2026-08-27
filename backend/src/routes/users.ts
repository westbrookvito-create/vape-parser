import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/me", async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  res.json(user);
});

router.patch("/me", async (req, res) => {
  const { bio, businessNiche, city, age, datingEnabled, datingBio, datingPhotoUrl } = req.body ?? {};

  const current = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });

  // Любое изменение анкеты знакомств при включённом флаге уходит на повторную модерацию.
  const touchesDatingProfile = datingEnabled && (datingBio !== undefined || datingPhotoUrl !== undefined || !current.datingEnabled);
  const nextDatingStatus = datingEnabled
    ? touchesDatingProfile
      ? "PENDING"
      : current.datingStatus
    : current.datingStatus;

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: {
      bio,
      businessNiche,
      city,
      age,
      datingEnabled,
      datingBio,
      datingPhotoUrl,
      ...(datingEnabled
        ? { datingStatus: nextDatingStatus, datingRejectionReason: nextDatingStatus === "PENDING" ? null : undefined }
        : {}),
    },
  });

  res.json(user);
});

// Заявка на разрешение публиковать офферы в "Вакансиях" — рассматривает только админ.
router.post("/me/offer-request", async (req, res) => {
  const current = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  if (current.canPostOffers) {
    return res.status(400).json({ error: "У вас уже есть право публиковать офферы" });
  }

  const pending = await prisma.offerPermissionRequest.findFirst({
    where: { userId: req.userId!, status: "PENDING" },
  });
  if (pending) return res.json(pending);

  const { message } = req.body ?? {};
  const request = await prisma.offerPermissionRequest.create({
    data: { userId: req.userId!, message: typeof message === "string" ? message.slice(0, 500) : null },
  });

  res.status(201).json(request);
});

router.get("/me/offer-request", async (req, res) => {
  const request = await prisma.offerPermissionRequest.findFirst({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  res.json(request);
});

export default router;
