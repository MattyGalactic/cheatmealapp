import type { RecommendationsApiResponse } from "./api";

export type CravingKey =
  | "Crispy"
  | "Cheesy"
  | "Sweet"
  | "Spicy"
  | "Savory"
  | "Fresh"
  | "Comfort"
  | "High-Protein"
  | "Low-Cal";

export type RecommendationListItem = RecommendationsApiResponse["results"][number];

const KEYWORD_RULES: Array<{ craving: Exclude<CravingKey, "High-Protein" | "Low-Cal">; keywords: string[] }> = [
  { craving: "Crispy", keywords: ["crispy", "fried", "crunchy", "breaded", "tenders", "nuggets", "chips"] },
  { craving: "Cheesy", keywords: ["cheese", "cheesy", "queso", "mozzarella", "cheddar", "parmesan"] },
  { craving: "Sweet", keywords: ["cookie", "brownie", "shake", "sundae", "ice cream", "donut", "cinnamon", "chocolate", "caramel"] },
  { craving: "Spicy", keywords: ["spicy", "buffalo", "hot", "jalapeno", "sriracha", "habanero", "fire", "pepper"] },
  { craving: "Savory", keywords: ["bacon", "bbq", "ranch", "garlic", "steak", "beef", "sausage", "umami"] },
  { craving: "Fresh", keywords: ["salad", "bowl", "veggie", "vegetables", "avocado", "fresh", "greens"] },
  { craving: "Comfort", keywords: ["mac", "mashed", "gravy", "fries", "tots", "pizza", "burger", "melt"] },
];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function safeProteinPer100Cal(calories: number, proteinGrams: number): number {
  if (!Number.isFinite(calories) || calories <= 0) return 0;
  if (!Number.isFinite(proteinGrams) || proteinGrams < 0) return 0;
  return proteinGrams / (calories / 100);
}

export function getCravingsForResult(
  item: Pick<RecommendationListItem, "itemName" | "calories" | "proteinGrams">,
  calorieBudget: number,
): CravingKey[] {
  const text = normalizeText(item.itemName);
  const cravings = new Set<CravingKey>();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => text.includes(normalizeText(keyword)))) {
      cravings.add(rule.craving);
    }
  }

  const proteinPer100Cal = safeProteinPer100Cal(item.calories, item.proteinGrams);
  if (item.proteinGrams >= 30 || proteinPer100Cal >= 7) {
    cravings.add("High-Protein");
  }

  if (item.calories <= 350 || item.calories <= calorieBudget * 0.8) {
    cravings.add("Low-Cal");
  }

  return [...cravings];
}

export function tagResultsWithCravings(
  results: RecommendationListItem[],
  calorieBudget: number,
): Array<RecommendationListItem & { cravings: CravingKey[] }> {
  return results.map((result) => ({
    ...result,
    cravings: getCravingsForResult(result, calorieBudget),
  }));
}

export function filterByCravings<T extends { cravings: string[] }>(
  results: T[],
  selectedCravings: string[],
): T[] {
  if (selectedCravings.length === 0) return [...results];
  return results.filter((result) => selectedCravings.every((craving) => result.cravings.includes(craving)));
}

