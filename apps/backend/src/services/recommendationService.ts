import { rankMeals } from "@cheatmeal/ranking";
import type {
  MenuItemRecord,
  RecommendationResponse,
  RestaurantRecord,
  SearchRecommendationsInput,
} from "@cheatmeal/types";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { mockMenuItems, mockRestaurants } from "../data/mockSeed.js";
import { buildWhyThisWorks } from "./explanations.js";
import { filterCandidates } from "./filtering.js";

async function loadFromDb(): Promise<{ restaurants: RestaurantRecord[]; menuItems: MenuItemRecord[] } | null> {
  if (!pool) return null;

  const restaurantSql = `
    SELECT
      id,
      name,
      address,
      city,
      state,
      latitude,
      longitude,
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
    pool.query<RestaurantRecord>(restaurantSql),
    pool.query<MenuItemRecord>(menuSql),
  ]);

  return {
    restaurants: restaurantsResult.rows,
    menuItems: menuResult.rows,
  };
}

export async function getRecommendations(
  input: SearchRecommendationsInput,
): Promise<RecommendationResponse> {
  const dbData = await loadFromDb().catch(() => null);
  const restaurants = dbData?.restaurants ?? mockRestaurants;
  const menuItems = dbData?.menuItems ?? mockMenuItems;

  const candidates = filterCandidates({
    menuItems,
    restaurants,
    calorieBudget: input.calories,
    radiusMiles: env.SEARCH_RADIUS_MILES,
    city: env.PILOT_CITY,
    state: env.PILOT_STATE,
  });

  const ranked = rankMeals(
    candidates.map((candidate) => ({
      itemId: candidate.id,
      itemName: candidate.name,
      calories: candidate.calories,
      proteinGrams: candidate.proteinGrams,
      priceUsd: candidate.priceUsd,
      restaurant: candidate.restaurant,
    })),
  ).map((rankedItem, index) => ({
    ...rankedItem,
    rank: index + 1,
    whyThisWorks: buildWhyThisWorks(rankedItem, input.calories),
  }));

  return {
    query: {
      calories: input.calories,
      radiusMiles: env.SEARCH_RADIUS_MILES,
      city: env.PILOT_CITY,
      state: env.PILOT_STATE,
    },
    results: ranked,
    meta: {
      total: ranked.length,
      dataSource: dbData ? "postgres" : "mock",
    },
  };
}
