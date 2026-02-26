import type { RankedMealCandidate } from "@cheatmeal/types";

export function buildWhyThisWorks(item: RankedMealCandidate, calorieBudget: number): string {
  const proteinDensity = item.proteinGrams / Math.max(item.calories, 1);
  const budgetRatio = item.calories / calorieBudget;

  if (proteinDensity >= 0.08) {
    return `High protein for ${item.calories} calories.`;
  }

  if (budgetRatio <= 0.7) {
    return "Lower calorie indulgence option.";
  }

  return "Balanced choice under your budget.";
}

