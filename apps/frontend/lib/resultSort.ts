import type { RecommendationSortKey, RecommendationsApiResponse } from "./api";

export type RecommendationListItem = RecommendationsApiResponse["results"][number];

export function sortRecommendationResults(
  results: RecommendationListItem[],
  sort: RecommendationSortKey,
): RecommendationListItem[] {
  if (sort === "best_match") {
    return [...results];
  }

  return results
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (sort === "restaurant") {
        return (
          a.item.restaurant.name.localeCompare(b.item.restaurant.name) ||
          a.item.itemName.localeCompare(b.item.itemName) ||
          a.index - b.index
        );
      }

      if (sort === "highest_protein") {
        return (
          b.item.proteinGrams - a.item.proteinGrams ||
          a.item.calories - b.item.calories ||
          a.index - b.index
        );
      }

      return (
        a.item.calories - b.item.calories ||
        b.item.proteinGrams - a.item.proteinGrams ||
        a.index - b.index
      );
    })
    .map(({ item }) => item);
}
