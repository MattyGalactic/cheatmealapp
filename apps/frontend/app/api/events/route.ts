import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createEvent, listEvents } from "../../../lib/server/eventStore";

export const runtime = "nodejs";

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
      metadataJson: payload.metadata_json ?? null,
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

