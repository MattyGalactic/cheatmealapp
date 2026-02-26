import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRecommendations } from "../../../lib/server/searchService";

export const runtime = "nodejs";

const querySchema = z.object({
  calories: z.coerce.number().int().min(50).max(2000),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    calories: request.nextUrl.searchParams.get("calories"),
    page: request.nextUrl.searchParams.get("page"),
    pageSize: request.nextUrl.searchParams.get("pageSize"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { calories, page, pageSize } = parsed.data;
    const response = await getRecommendations({ calories });
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return NextResponse.json({
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
    return NextResponse.json(
      {
        error: "Failed to load recommendations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

