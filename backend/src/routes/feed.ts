import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const postInclude = {
  author: { select: { id: true, firstName: true, lastName: true, username: true, photoUrl: true, businessNiche: true } },
  likes: { select: { userId: true } },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
  },
};

router.get("/", async (req, res) => {
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const posts = await prisma.post.findMany({
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  res.json({
    posts: posts.map((p) => ({ ...p, likedByMe: p.likes.some((l) => l.userId === req.userId) })),
    nextCursor: posts.length === 20 ? posts[posts.length - 1].id : null,
  });
});

router.post("/", async (req, res) => {
  const { text, imageUrl } = req.body ?? {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Текст поста обязателен" });
  }

  const post = await prisma.post.create({
    data: { text: text.trim(), imageUrl: imageUrl || null, authorId: req.userId! },
    include: postInclude,
  });

  res.status(201).json({ ...post, likedByMe: false });
});

router.post("/:id/like", async (req, res) => {
  const postId = req.params.id;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: req.userId! } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return res.json({ liked: false });
  }

  await prisma.like.create({ data: { postId, userId: req.userId! } });
  res.json({ liked: true });
});

router.post("/:id/comments", async (req, res) => {
  const { text } = req.body ?? {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Текст комментария обязателен" });
  }

  const comment = await prisma.comment.create({
    data: { text: text.trim(), postId: req.params.id, authorId: req.userId! },
    include: { author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
  });

  res.status(201).json(comment);
});

export default router;
