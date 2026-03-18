import type { RecommendationsApiResponse } from "./api";

export type RecommendationListItem = RecommendationsApiResponse["results"][number];

type ExplanationInput = {
  calories?: number | null;
  proteinGrams?: number | null;
  calorieBudget: number;
  isLowestCalorieBucket: boolean;
};

export function getWhyThisWorksExplanation(input: ExplanationInput): string {
  const calories = input.calories ?? 0;
  const proteinGrams = input.proteinGrams ?? 0;

  if (!Number.isFinite(calories) || calories <= 0) {
    return "Fits your calorie target based on available nutrition data.";
  }

  const proteinPer100Cal = calories > 0 ? proteinGrams / (calories / 100) : 0;
  const budgetGap = input.calorieBudget - calories;
  const withinBudget = budgetGap >= 0;
  const underBudgetPct =
    input.calorieBudget > 0 ? budgetGap / input.calorieBudget : Number.POSITIVE_INFINITY;

  if (proteinPer100Cal >= 8) {
    return `${proteinGrams}g protein at ${calories} calories (${proteinPer100Cal.toFixed(1)}g per 100 cal), which is strong for this calorie range.`;
  }

  if (withinBudget && underBudgetPct <= 0.08) {
    return `${calories} calories puts you within ${Math.max(0, budgetGap)} of your target, so it uses your budget efficiently.`;
  }

  if (calories <= input.calorieBudget * 0.7 && proteinPer100Cal >= 5) {
    return `${proteinGrams}g protein for ${calories} calories leaves room in your budget while keeping protein density solid.`;
  }

  if (input.isLowestCalorieBucket) {
    return `${calories} calories is among the lighter options in this result set if you want to stay conservative.`;
  }

  return `${calories} calories with ${proteinGrams}g protein is a reasonable fit for your current target.`;
}

export function buildWhyThisWorksMap(
  results: RecommendationListItem[],
  calorieBudget: number,
): Map<string, string> {
  const validCalories = results
    .map((result) => result.calories)
    .filter((value): value is number => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  const lowestBucketCount = Math.max(1, Math.ceil(results.length * 0.2));
  const cutoffIndex = Math.max(0, Math.min(validCalories.length - 1, lowestBucketCount - 1));
  const lowestCalorieCutoff = validCalories.length > 0 ? validCalories[cutoffIndex] : null;

  return new Map(
    results.map((result) => [
      result.itemId,
      getWhyThisWorksExplanation({
        calories: result.calories,
        proteinGrams: result.proteinGrams,
        calorieBudget,
        isLowestCalorieBucket:
          lowestCalorieCutoff !== null &&
          Number.isFinite(result.calories) &&
          result.calories > 0 &&
          result.calories <= lowestCalorieCutoff,
      }),
    ]),
  );
}
