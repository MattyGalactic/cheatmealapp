export type RestaurantRecord = {
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

export type MenuItemRecord = {
  id: string;
  restaurantId: string;
  name: string;
  calories: number;
  proteinGrams: number;
  priceUsd?: number | null;
};

export type RankingInputItem = {
  itemId: string;
  itemName: string;
  calories: number;
  proteinGrams: number;
  priceUsd?: number | null;
  restaurant: RestaurantRecord;
};

export type RankedMealCandidate = RankingInputItem & {
  score: number;
};

export type SearchRecommendationsInput = {
  calories: number;
};

export type RecommendationResult = RankedMealCandidate & {
  rank: number;
  whyThisWorks: string;
};

export type RecommendationResponse = {
  query: {
    calories: number;
    radiusMiles: number;
    city: string;
    state: string;
  };
  results: RecommendationResult[];
  meta: {
    total: number;
    dataSource: "postgres" | "mock";
  };
};
