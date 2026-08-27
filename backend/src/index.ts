import "dotenv/config";
import cors from "cors";
import express from "express";
import { requireAdmin, requireAuth } from "./middleware/auth";
import adminRouter from "./routes/admin";
import datingRouter from "./routes/dating";
import feedRouter from "./routes/feed";
import usersRouter from "./routes/users";
import vacanciesRouter from "./routes/vacancies";
import { startBot } from "./telegram/bot";

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN ?? "").split(",").map((s) => s.trim()).filter(Boolean);

app.use(cors({ origin: corsOrigins.length ? corsOrigins : true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", requireAuth);
app.use("/api/users", usersRouter);
app.use("/api/feed", feedRouter);
app.use("/api/dating", datingRouter);
app.use("/api/vacancies", vacanciesRouter);
app.use("/api/admin", requireAdmin, adminRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`HstlGram API запущен на порту ${port}`));

startBot();
