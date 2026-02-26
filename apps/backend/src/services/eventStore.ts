import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { pool } from "../db/pool.js";

export type EventName = "search_submitted" | "result_clicked" | "maps_opened";

export type EventRecord = {
  id: string;
  eventName: EventName;
  sessionId: string;
  caloriesBudget: number | null;
  restaurantId: string | null;
  restaurantName: string | null;
  itemId: string | null;
  itemName: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
};

export type CreateEventInput = Omit<EventRecord, "id" | "createdAt">;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackDataDir = path.resolve(__dirname, "..", "..", ".data");
const fallbackEventsPath = path.join(fallbackDataDir, "events.jsonl");

function normalizeEventRow(row: {
  id: string;
  eventName?: string;
  event_name?: string;
  sessionId?: string;
  session_id?: string;
  caloriesBudget?: number | null;
  calories_budget?: number | null;
  restaurantId?: string | null;
  restaurant_id?: string | null;
  restaurantName?: string | null;
  restaurant_name?: string | null;
  itemId?: string | null;
  item_id?: string | null;
  itemName?: string | null;
  item_name?: string | null;
  metadataJson?: Record<string, unknown> | null;
  metadata_json?: Record<string, unknown> | null;
  createdAt?: string | Date;
  created_at?: string | Date;
}): EventRecord {
  return {
    id: row.id,
    eventName: (row.eventName ?? row.event_name) as EventName,
    sessionId: String(row.sessionId ?? row.session_id ?? ""),
    caloriesBudget: row.caloriesBudget ?? row.calories_budget ?? null,
    restaurantId: row.restaurantId ?? row.restaurant_id ?? null,
    restaurantName: row.restaurantName ?? row.restaurant_name ?? null,
    itemId: row.itemId ?? row.item_id ?? null,
    itemName: row.itemName ?? row.item_name ?? null,
    metadataJson: row.metadataJson ?? row.metadata_json ?? null,
    createdAt: new Date(row.createdAt ?? row.created_at ?? new Date()).toISOString(),
  };
}

async function appendFallbackEvent(event: EventRecord): Promise<void> {
  await mkdir(fallbackDataDir, { recursive: true });
  await appendFile(fallbackEventsPath, `${JSON.stringify(event)}\n`, "utf8");
}

async function listFallbackEvents(limit: number): Promise<EventRecord[]> {
  try {
    const content = await readFile(fallbackEventsPath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as EventRecord)
      .slice(-limit)
      .reverse();
  } catch {
    return [];
  }
}

export async function createEvent(input: CreateEventInput): Promise<void> {
  const event: EventRecord = {
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };

  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO events (
          id, event_name, session_id, calories_budget, restaurant_id,
          restaurant_name, item_id, item_name, metadata_json, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `,
        [
          event.id,
          event.eventName,
          event.sessionId,
          event.caloriesBudget,
          event.restaurantId,
          event.restaurantName,
          event.itemId,
          event.itemName,
          event.metadataJson,
          event.createdAt,
        ],
      );
      return;
    } catch {
      // Fall back to local JSONL if DB is unavailable or events table is not migrated.
    }
  }

  await appendFallbackEvent(event);
}

export async function listEvents(limit: number): Promise<EventRecord[]> {
  if (pool) {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          event_name,
          session_id,
          calories_budget,
          restaurant_id,
          restaurant_name,
          item_id,
          item_name,
          metadata_json,
          created_at
        FROM events
        ORDER BY created_at DESC
        LIMIT $1
        `,
        [limit],
      );

      return result.rows.map((row) => normalizeEventRow(row));
    } catch {
      // Fall back to JSONL when DB read fails.
    }
  }

  return listFallbackEvents(limit);
}

