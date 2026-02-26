export type RecommendationSortKey =
  | "best_match"
  | "highest_protein"
  | "lowest_calories"
  | "restaurant";

export type RecommendationsApiResponse = {
  query: {
    calories: number;
    radiusMiles: number;
    city: string;
    state: string;
  };
  results: Array<{
    itemId: string;
    itemName: string;
    calories: number;
    proteinGrams: number;
    priceUsd?: number | null;
    restaurant: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      latitude: number;
      longitude: number;
      isChain: boolean;
      ratingWeight: number;
      distanceMiles?: number | null;
    };
    score: number;
    rank: number;
    whyThisWorks: string;
  }>;
  meta: {
    total: number;
    dataSource: "postgres" | "mock";
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function fetchRecommendations(params: {
  calories: number;
  page?: number;
  pageSize?: number;
  baseUrl?: string;
}): Promise<RecommendationsApiResponse> {
  const search = new URLSearchParams({
    calories: String(params.calories),
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 20),
  });

  const baseUrl = params.baseUrl ?? API_BASE;

  const response = await fetch(`${baseUrl}/api/search?${search.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }

  return response.json();
}
