import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createEvent, listEvents } from "../../../lib/server/eventStore";

export const runtime = "nodejs";

const allowedEventNames = [
  "search_submitted",
  "result_selected",
  "maps_opened",
  "filter_changed",
  "order_clicked",
  "distance_clicked",
  "provider_changed",
] as const;
const allowedProviders = ["doordash", "ubereats"] as const;
const allowedMatchModes = ["all", "any"] as const;

const createEventSchema = z.object({
  event_name: z.enum(allowedEventNames),
  session_id: z.string().min(1).max(128),
  calories_budget: z.number().int().min(0).max(5000).nullable().optional(),
  restaurant_id: z.string().max(256).nullable().optional(),
  restaurant_name: z.string().max(256).nullable().optional(),
  item_id: z.string().max(256).nullable().optional(),
  item_name: z.string().max(256).nullable().optional(),
  rank_position: z.number().int().min(1).max(500).nullable().optional(),
  cravings_selected: z.array(z.string().max(64)).max(20).nullable().optional(),
  match_mode: z.enum(allowedMatchModes).nullable().optional(),
  sort_mode: z.string().max(64).nullable().optional(),
  provider: z.enum(allowedProviders).nullable().optional(),
  previous_provider: z.enum(allowedProviders).nullable().optional(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = createEventSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event payload", details: parsed.error.flatten() },
      { status: 400 },
    );
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
      rankPosition: payload.rank_position ?? null,
      cravingsSelected: payload.cravings_selected ?? null,
      matchMode: payload.match_mode ?? null,
      sortMode: payload.sort_mode ?? null,
      provider: payload.provider ?? null,
      previousProvider: payload.previous_provider ?? null,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to persist event", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = listQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const events = await listEvents(parsed.data.limit);
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load events", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
