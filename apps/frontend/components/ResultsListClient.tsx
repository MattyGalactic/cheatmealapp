"use client";

import { useState } from "react";
import Link from "next/link";
import { MealCard } from "./MealCard";
import type { RecommendationSortKey, RecommendationsApiResponse } from "../lib/api";
import type { CravingKey } from "../lib/cravings";
import { filterByCravings, tagResultsWithCravings } from "../lib/cravings";
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

const CRAVING_OPTIONS: CravingKey[] = [
  "Crispy",
  "Cheesy",
  "Sweet",
  "Spicy",
  "Savory",
  "Fresh",
  "Comfort",
  "High-Protein",
  "Low-Cal",
];

export function ResultsListClient({ calorieBudget, data, nextHref }: ResultsListClientProps) {
  const [sort, setSort] = useState<RecommendationSortKey>("best_match");
  const [selectedCravings, setSelectedCravings] = useState<CravingKey[]>([]);
  const taggedResults = tagResultsWithCravings(data.results, calorieBudget);
  const filteredResults = filterByCravings(taggedResults, selectedCravings);
  const sortedResults = sortRecommendationResults(filteredResults, sort);
  const whyMap = buildWhyThisWorksMap(data.results, calorieBudget);

  const toggleCraving = (craving: CravingKey) => {
    setSelectedCravings((current) =>
      current.includes(craving)
        ? current.filter((value) => value !== craving)
        : [...current, craving],
    );
  };

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

      <section className="craving-panel" aria-label="Craving filters">
        <div className="craving-panel-header">
          <p className="sort-label">Craving</p>
          <button
            type="button"
            className="clear-button"
            onClick={() => setSelectedCravings([])}
            disabled={selectedCravings.length === 0}
          >
            Clear
          </button>
        </div>
        <div className="chip-wrap">
          {CRAVING_OPTIONS.map((craving) => {
            const selected = selectedCravings.includes(craving);
            return (
              <button
                key={craving}
                type="button"
                className={`chip${selected ? " selected" : ""}`}
                aria-pressed={selected}
                onClick={() => toggleCraving(craving)}
              >
                {craving}
              </button>
            );
          })}
        </div>
      </section>

      {data.results.length === 0 ? (
        <p className="empty">No meals found under your calorie budget. Try a higher number.</p>
      ) : filteredResults.length === 0 ? (
        <p className="empty">No results match all selected cravings. Try clearing a chip.</p>
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
