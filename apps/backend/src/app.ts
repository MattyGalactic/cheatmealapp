import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { eventsRouter } from "./routes/events.js";
import { recommendationsRouter } from "./routes/recommendations.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "cheat-meal-backend" });
  });

  app.use("/api/recommendations", recommendationsRouter);
  app.use("/api/events", eventsRouter);

  return app;
}
