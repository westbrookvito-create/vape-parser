import { Router } from "express";

const router = Router();

// Раздел в разработке — фронтенд показывает заглушку "Скоро будет".
router.get("/", async (_req, res) => {
  res.json({ comingSoon: true, items: [] });
});

export default router;
