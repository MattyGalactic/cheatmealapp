import assert from "node:assert/strict";
import { buildWhyThisWorksMap, getWhyThisWorksExplanation } from "./whyThisWorks";
import { sortRecommendationResults } from "./resultSort";
import type { RecommendationsApiResponse } from "./api";

function run() {
  assert.equal(
    getWhyThisWorksExplanation({
      calories: 200,
      proteinGrams: 18,
      calorieBudget: 400,
      isLowestCalorieBucket: false,
    }),
    "High protein for the calories.",
  );

  assert.equal(
    getWhyThisWorksExplanation({
      calories: 380,
      proteinGrams: 12,
      calorieBudget: 400,
      isLowestCalorieBucket: false,
    }),
    "Maximizes your budget without going over.",
  );

  const results = [
    { itemId: "a", calories: 120, proteinGrams: 2 },
    { itemId: "b", calories: 250, proteinGrams: 8 },
    { itemId: "c", calories: 400, proteinGrams: 12 },
    { itemId: "d", calories: 520, proteinGrams: 25 },
    { itemId: "e", calories: 600, proteinGrams: 28 },
  ] as RecommendationsApiResponse["results"];

  const map = buildWhyThisWorksMap(results, 650);
  assert.equal(map.get("a"), "Lowest-calorie option in this set.");

  const restaurantSorted = [
    {
      itemId: "1",
      itemName: "Z Item",
      calories: 300,
      proteinGrams: 10,
      priceUsd: null,
      score: 1,
      rank: 1,
      whyThisWorks: "",
      restaurant: {
        id: "r2",
        name: "Zaxby's",
        address: "",
        city: "Nashville",
        state: "TN",
        latitude: 0,
        longitude: 0,
        isChain: true,
        ratingWeight: 1,
      },
    },
    {
      itemId: "2",
      itemName: "A Item",
      calories: 250,
      proteinGrams: 20,
      priceUsd: null,
      score: 2,
      rank: 2,
      whyThisWorks: "",
      restaurant: {
        id: "r1",
        name: "Chipotle",
        address: "",
        city: "Nashville",
        state: "TN",
        latitude: 0,
        longitude: 0,
        isChain: true,
        ratingWeight: 1,
      },
    },
  ] as RecommendationsApiResponse["results"];

  assert.equal(sortRecommendationResults(restaurantSorted, "restaurant")[0]?.restaurant.name, "Chipotle");

  console.log("whyThisWorks dev test passed");
}

run();
