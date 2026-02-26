import { Router } from "express";
import { z } from "zod";
import { getRecommendations } from "../services/recommendationService.js";

const querySchema = z.object({
  calories: z.coerce.number().int().min(50).max(2000),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const recommendationsRouter = Router();

recommendationsRouter.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten(),
    });
  }

  try {
    const { calories, page, pageSize } = parsed.data;
    const response = await getRecommendations({ calories });

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return res.json({
      ...response,
      results: response.results.slice(start, end),
      meta: {
        ...response.meta,
        page,
        pageSize,
        hasMore: end < response.meta.total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load recommendations",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
