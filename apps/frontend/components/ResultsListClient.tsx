"use client";

import { useState } from "react";
import Link from "next/link";
import { MealCard } from "./MealCard";
import type { RecommendationSortKey, RecommendationsApiResponse } from "../lib/api";
import { sortRecommendationResults } from "../lib/resultSort";
import { buildWhyThisWorksMap } from "../lib/whyThisWorks";

type ResultsListClientProps = {
  calorieBudget: number;
  data: RecommendationsApiResponse;
  nextHref: string;
};

const SORT_OPTIONS: Array<{ value: RecommendationSortKey; label: string }> = [
  { value: "best_match", label: "Best match" },
  { value: "highest_protein", label: "Highest protein" },
  { value: "lowest_calories", label: "Lowest calories" },
  { value: "restaurant", label: "Restaurant" },
];

export function ResultsListClient({ calorieBudget, data, nextHref }: ResultsListClientProps) {
  const [sort, setSort] = useState<RecommendationSortKey>("best_match");
  const sortedResults = sortRecommendationResults(data.results, sort);
  const whyMap = buildWhyThisWorksMap(data.results, calorieBudget);

  return (
    <>
      <div className="sort-bar">
        <label htmlFor="sort" className="sort-label">Sort</label>
        <select
          id="sort"
          name="sort"
          value={sort}
          className="select"
          onChange={(event) => setSort(event.target.value as RecommendationSortKey)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {data.results.length === 0 ? (
        <p className="empty">No meals found under your calorie budget. Try a higher number.</p>
      ) : (
        <section className="results-grid" aria-label="Recommended meals">
          {sortedResults.map((result) => (
            <MealCard
              key={result.itemId}
              result={result}
              whyThisWorks={whyMap.get(result.itemId)}
              calorieBudget={calorieBudget}
            />
          ))}
        </section>
      )}

      <nav className="pagination" aria-label="Pagination">
        <Link className="link-button" href="/">
          New Search
        </Link>
        {data.meta.hasMore ? (
          <Link className="link-button" href={nextHref}>
            Next Page
          </Link>
        ) : (
          <span className="link-button">End of results</span>
        )}
      </nav>
    </>
  );
}
