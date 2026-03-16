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
    return "Clean fit for the calories you have left";
  }

  const proteinPer100Cal = proteinGrams / (calories / 100);
  const budgetGap = input.calorieBudget - calories;
  const withinBudget = budgetGap >= 0;
  const underBudgetPct =
    input.calorieBudget > 0 ? budgetGap / input.calorieBudget : Number.POSITIVE_INFINITY;

  if (proteinPer100Cal >= 8) {
    return "Highest-protein move without wasting calories";
  }

  if (withinBudget && underBudgetPct <= 0.08) {
    return "Uses almost all your budget on something actually satisfying";
  }

  if (calories <= input.calorieBudget * 0.7 && proteinPer100Cal >= 5) {
    return "Leaves room in the day while still feeling like a real meal";
  }

  if (input.isLowestCalorieBucket) {
    return "Lightest option in this batch if you want to play it safe";
  }

  return "Strong overall fit for the calories you have left";
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
