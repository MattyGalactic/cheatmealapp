import { rankMeals } from "@cheatmeal/ranking";
import type {
  MenuItemRecord,
  RecommendationResponse,
  RestaurantRecord,
  SearchRecommendationsInput,
} from "@cheatmeal/types";
import { dbPool } from "./db";
import { serverEnv } from "./env";
import { buildWhyThisWorks } from "./explanations";
import { filterCandidates } from "./filtering";
import { mockMenuItems, mockRestaurants } from "./mockSeed";

async function loadFromDb(): Promise<{ restaurants: RestaurantRecord[]; menuItems: MenuItemRecord[] } | null> {
  if (!dbPool) return null;

  const restaurantSql = `
    SELECT
      id, name, address, city, state, latitude, longitude,
      is_chain AS "isChain",
      rating_weight AS "ratingWeight",
      distance_miles AS "distanceMiles"
    FROM restaurants
  `;

  const menuSql = `
    SELECT
      id,
      restaurant_id AS "restaurantId",
      name,
      calories,
      protein_grams AS "proteinGrams",
      price_usd AS "priceUsd"
    FROM menu_items
  `;

  const [restaurantsResult, menuResult] = await Promise.all([
    dbPool.query<RestaurantRecord>(restaurantSql),
    dbPool.query<MenuItemRecord>(menuSql),
  ]);

  return { restaurants: restaurantsResult.rows, menuItems: menuResult.rows };
}

export async function getRecommendations(input: SearchRecommendationsInput): Promise<RecommendationResponse> {
  const dbData = await loadFromDb().catch(() => null);
  const restaurants = dbData?.restaurants ?? mockRestaurants;
  const menuItems = dbData?.menuItems ?? mockMenuItems;

  const candidates = filterCandidates({
    menuItems,
    restaurants,
    calorieBudget: input.calories,
    radiusMiles: serverEnv.SEARCH_RADIUS_MILES,
    city: serverEnv.PILOT_CITY,
    state: serverEnv.PILOT_STATE,
  });

  const rankedCandidates = rankMeals(
    candidates.map((candidate) => ({
      itemId: candidate.id,
      itemName: candidate.name,
      calories: candidate.calories,
      proteinGrams: candidate.proteinGrams,
      priceUsd: candidate.priceUsd,
      restaurant: candidate.restaurant,
    })),
  );

  // Multiple nearby locations of the same chain can produce identical item names.
  // Keep only the top-scoring instance per chain+item for a cleaner recommendation list.
  const dedupedByChainItem = rankedCandidates.filter((candidate, index, list) => {
    const candidateKey = `${candidate.restaurant.name.toLowerCase()}::${candidate.itemName.toLowerCase()}`;
    const firstIndex = list.findIndex((item) => {
      const key = `${item.restaurant.name.toLowerCase()}::${item.itemName.toLowerCase()}`;
      return key === candidateKey;
    });
    return firstIndex === index;
  });

  const ranked = dedupedByChainItem.map((rankedItem, index) => ({
    ...rankedItem,
    rank: index + 1,
    whyThisWorks: buildWhyThisWorks(rankedItem, input.calories),
  }));

  return {
    query: {
      calories: input.calories,
      radiusMiles: serverEnv.SEARCH_RADIUS_MILES,
      city: serverEnv.PILOT_CITY,
      state: serverEnv.PILOT_STATE,
    },
    results: ranked,
    meta: {
      total: ranked.length,
      dataSource: dbData ? "postgres" : "mock",
    },
  };
}
