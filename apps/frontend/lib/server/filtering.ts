import type { MenuItemRecord, RestaurantRecord } from "@cheatmeal/types";

export type CandidateRow = MenuItemRecord & {
  restaurant: RestaurantRecord;
};

export function filterCandidates(params: {
  menuItems: MenuItemRecord[];
  restaurants: RestaurantRecord[];
  calorieBudget: number;
  radiusMiles: number;
  city: string;
  state: string;
}): CandidateRow[] {
  const byRestaurantId = new Map(params.restaurants.map((r) => [r.id, r]));

  return params.menuItems
    .filter((item) => item.calories <= params.calorieBudget)
    .map((item) => ({ item, restaurant: byRestaurantId.get(item.restaurantId) }))
    .filter((row): row is { item: MenuItemRecord; restaurant: RestaurantRecord } => Boolean(row.restaurant))
    .filter(({ restaurant }) => restaurant.isChain)
    .filter(({ restaurant }) => restaurant.city.toLowerCase() === params.city.toLowerCase())
    .filter(({ restaurant }) => restaurant.state.toLowerCase() === params.state.toLowerCase())
    .filter(({ restaurant }) => (restaurant.distanceMiles ?? Number.POSITIVE_INFINITY) <= params.radiusMiles)
    .map(({ item, restaurant }) => ({ ...item, restaurant }));
}

