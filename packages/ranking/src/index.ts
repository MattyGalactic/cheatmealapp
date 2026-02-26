import type { RankedMealCandidate, RankingInputItem } from "@cheatmeal/types";

export type ScoreBreakdown = {
  proteinScore: number;
  caloriePenalty: number;
  restaurantWeight: number;
};

export function computeScore(item: RankingInputItem): { score: number; breakdown: ScoreBreakdown } {
  const proteinScore = item.proteinGrams * 2;
  const caloriePenalty = item.calories / 100;
  const restaurantWeight = item.restaurant.ratingWeight ?? 1;
  const rawScore = (proteinScore - caloriePenalty) * restaurantWeight;

  return {
    score: Number(rawScore.toFixed(2)),
    breakdown: { proteinScore, caloriePenalty, restaurantWeight },
  };
}

export function rankMeals(items: RankingInputItem[]): RankedMealCandidate[] {
  return [...items]
    .map((item) => ({
      ...item,
      score: computeScore(item).score,
    }))
    .sort((a, b) => b.score - a.score || a.calories - b.calories || b.proteinGrams - a.proteinGrams);
}
