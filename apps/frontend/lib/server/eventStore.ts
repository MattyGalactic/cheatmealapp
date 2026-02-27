import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { dbPool } from "./db";

export type EventName =
  | "search_submitted"
  | "result_selected"
  | "maps_opened"
  | "filter_changed"
  | "order_clicked"
  | "distance_clicked"
  | "change_provider_clicked";

export type EventRecord = {
  id: string;
  eventName: EventName;
  sessionId: string;
  caloriesBudget: number | null;
  restaurantId: string | null;
  restaurantName: string | null;
  itemId: string | null;
  itemName: string | null;
  rankPosition: number | null;
  cravingsSelected: string[] | null;
  matchMode: string | null;
  sortMode: string | null;
  provider: string | null;
  createdAt: string;
};

export type CreateEventInput = Omit<EventRecord, "id" | "createdAt">;

const fallbackDataDir = path.resolve(process.cwd(), ".data");
const fallbackEventsPath = path.join(fallbackDataDir, "events.jsonl");

function normalizeEventRow(row: any): EventRecord {
  return {
    id: row.id,
    eventName: row.eventName ?? row.event_name,
    sessionId: String(row.sessionId ?? row.session_id ?? ""),
    caloriesBudget: row.caloriesBudget ?? row.calories_budget ?? null,
    restaurantId: row.restaurantId ?? row.restaurant_id ?? null,
    restaurantName: row.restaurantName ?? row.restaurant_name ?? null,
    itemId: row.itemId ?? row.item_id ?? null,
    itemName: row.itemName ?? row.item_name ?? null,
    rankPosition: row.rankPosition ?? row.rank_position ?? null,
    cravingsSelected: row.cravingsSelected ?? row.cravings_selected ?? null,
    matchMode: row.matchMode ?? row.match_mode ?? null,
    sortMode: row.sortMode ?? row.sort_mode ?? null,
    provider: row.provider ?? null,
    createdAt: new Date(row.createdAt ?? row.created_at ?? new Date()).toISOString(),
  };
}

async function appendFallbackEvent(event: EventRecord) {
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
  const event: EventRecord = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };

  if (dbPool) {
    try {
      await dbPool.query(
        `INSERT INTO events (
          id, event_name, session_id, calories_budget, restaurant_id, restaurant_name,
          item_id, item_name, rank_position, cravings_selected, match_mode, sort_mode, provider, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          event.id,
          event.eventName,
          event.sessionId,
          event.caloriesBudget,
          event.restaurantId,
          event.restaurantName,
          event.itemId,
          event.itemName,
          event.rankPosition,
          event.cravingsSelected,
          event.matchMode,
          event.sortMode,
          event.provider,
          event.createdAt,
        ],
      );
      return;
    } catch {
      // fall through to JSONL fallback
    }
  }

  await appendFallbackEvent(event);
}

export async function listEvents(limit: number): Promise<EventRecord[]> {
  if (dbPool) {
    try {
      const result = await dbPool.query(
        `SELECT id, event_name, session_id, calories_budget, restaurant_id, restaurant_name,
                item_id, item_name, rank_position, cravings_selected, match_mode, sort_mode, provider, created_at
         FROM events
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit],
      );
      return result.rows.map(normalizeEventRow);
    } catch {
      // fall back to JSONL
    }
  }

  return listFallbackEvents(limit);
}
