import { Router } from "express";
import { z } from "zod";
import { createEvent, listEvents } from "../services/eventStore.js";

const allowedEventNames = ["search_submitted", "result_clicked", "maps_opened"] as const;

const createEventSchema = z.object({
  event_name: z.enum(allowedEventNames),
  session_id: z.string().min(1).max(128),
  calories_budget: z.number().int().min(0).max(5000).nullable().optional(),
  restaurant_id: z.string().max(256).nullable().optional(),
  restaurant_name: z.string().max(256).nullable().optional(),
  item_id: z.string().max(256).nullable().optional(),
  item_name: z.string().max(256).nullable().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const eventsRouter = Router();

eventsRouter.post("/", async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid event payload",
      details: parsed.error.flatten(),
    });
  }

  try {
    const payload = parsed.data;
    await createEvent({
      eventName: payload.event_name,
      sessionId: payload.session_id,
      caloriesBudget: payload.calories_budget ?? null,
      restaurantId: payload.restaurant_id ?? null,
      restaurantName: payload.restaurant_name ?? null,
      itemId: payload.item_id ?? null,
      itemName: payload.item_name ?? null,
      metadataJson: payload.metadata_json ?? null,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      error: "Failed to persist event",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

eventsRouter.get("/", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  const parsed = listQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten(),
    });
  }

  try {
    const events = await listEvents(parsed.data.limit);
    return res.json({ events });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load events",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

