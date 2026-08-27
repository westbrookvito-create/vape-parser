import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/me", async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  res.json(user);
});

router.patch("/me", async (req, res) => {
  const { bio, businessNiche, city, age, datingEnabled, datingBio, datingPhotoUrl } = req.body ?? {};

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { bio, businessNiche, city, age, datingEnabled, datingBio, datingPhotoUrl },
  });

  res.json(user);
});

export default router;
