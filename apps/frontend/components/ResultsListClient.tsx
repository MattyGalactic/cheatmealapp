"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MealCard } from "./MealCard";
import type { RecommendationSortKey, RecommendationsApiResponse } from "../lib/api";
import type { CravingKey, CravingMatchMode } from "../lib/cravings";
import type { OrderProvider } from "../lib/orderLinks";
import { emitEvent } from "../lib/events";
import { trackEvent } from "../lib/analytics";
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
  const [provider, setProvider] = useState<OrderProvider | null>(null);
  const [selectedCravings, setSelectedCravings] = useState<CravingKey[]>([]);
  const [cravingMode, setCravingMode] = useState<CravingMatchMode>("all");
  const [cravingsOpen, setCravingsOpen] = useState(false);
  const taggedResults = tagResultsWithCravings(data.results, calorieBudget);
  const filteredResults = filterByCravings(taggedResults, selectedCravings, cravingMode);
  const sortedResults = sortRecommendationResults(filteredResults, sort);
  const whyMap = buildWhyThisWorksMap(data.results, calorieBudget);
  const topPick = sortedResults[0];
  const topPickWhy = topPick ? whyMap.get(topPick.itemId) ?? topPick.whyThisWorks : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem("cm_order_provider");
    setProvider(value === "doordash" || value === "ubereats" ? value : null);
  }, []);

  const updateProvider = (nextProvider: OrderProvider | null) => {
    const previousProvider = provider;

    if (typeof window !== "undefined") {
      if (nextProvider) {
        window.localStorage.setItem("cm_order_provider", nextProvider);
      } else {
        window.localStorage.removeItem("cm_order_provider");
      }
    }

    setProvider(nextProvider);

    if (previousProvider === nextProvider) {
      return;
    }

    emitEvent({
      event_name: "provider_changed",
      calories_budget: calorieBudget,
      provider: nextProvider,
      previous_provider: previousProvider,
    });
  };

  const trackFilterChanged = (next: {
    cravingsSelected?: CravingKey[];
    matchMode?: CravingMatchMode;
    sortMode?: RecommendationSortKey;
  }) => {
    emitEvent({
      event_name: "filter_changed",
      calories_budget: calorieBudget,
      cravings_selected: next.cravingsSelected ?? selectedCravings,
      match_mode: next.matchMode ?? cravingMode,
      sort_mode: next.sortMode ?? sort,
    });
  };

  const toggleCraving = (craving: CravingKey) => {
    setSelectedCravings((current) => {
      const updated = current.includes(craving)
        ? current.filter((value) => value !== craving)
        : [...current, craving];
      trackFilterChanged({ cravingsSelected: updated });
      return updated;
    });
  };

  return (
    <>
      <div className="filters-row" aria-label="Results controls">
        <div className="filters-main-controls">
          <div className="sort-inline sort-control">
            <div className="sort-select-wrap">
              <select
                id="sort"
                name="sort"
                value={sort}
                aria-label="Sort"
                className="select compact sort-select"
                onChange={(event) => {
                  const nextSort = event.target.value as RecommendationSortKey;
                  setSort(nextSort);
                  trackFilterChanged({ sortMode: nextSort });
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="provider-inline provider-control">
            <div className="provider-select-wrap">
              <select
                id="provider"
                name="provider"
                value={provider ?? ""}
                aria-label="Provider"
                className="select compact provider-select"
                onChange={(event) => {
                  const nextProvider = event.target.value;
                  updateProvider(nextProvider === "doordash" || nextProvider === "ubereats" ? nextProvider : null);
                }}
              >
                <option value="">Provider</option>
                <option value="doordash">DoorDash</option>
                <option value="ubereats">Uber Eats</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="cravings-toggle"
          aria-expanded={cravingsOpen}
          onClick={() => setCravingsOpen((open) => !open)}
        >
          <span className="filters-text">Filters{selectedCravings.length ? ` (${selectedCravings.length})` : ""}</span>
          <span className={`chevron${cravingsOpen ? " open" : ""}`}>v</span>
        </button>
      </div>

      {cravingsOpen ? (
        <section className="craving-panel" aria-label="Craving filters">
          <div className="craving-panel-header">
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSelectedCravings([]);
                trackFilterChanged({ cravingsSelected: [] });
              }}
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
          <div className="mode-toggle" role="group" aria-label="Craving match mode">
            <button
              type="button"
              className={`mode-option${cravingMode === "all" ? " active" : ""}`}
              aria-pressed={cravingMode === "all"}
              onClick={() => {
                setCravingMode("all");
                trackFilterChanged({ matchMode: "all" });
              }}
            >
              Match All
            </button>
            <button
              type="button"
              className={`mode-option${cravingMode === "any" ? " active" : ""}`}
              aria-pressed={cravingMode === "any"}
              onClick={() => {
                setCravingMode("any");
                trackFilterChanged({ matchMode: "any" });
              }}
            >
              Match Any
            </button>
          </div>
        </section>
      ) : null}

      {data.results.length === 0 ? (
        <section className="empty-state" aria-label="No meals found">
          <p className="empty-state-title">Nothing fits that calorie target yet.</p>
          <p className="empty">Try a slightly higher number and we’ll give you a better shot at a satisfying option.</p>
        </section>
      ) : filteredResults.length === 0 ? (
        <section className="empty-state" aria-label="No craving matches found">
          <p className="empty-state-title">Nothing matches that craving combo.</p>
          <p className="empty">Try switching to Match Any or clear a craving to bring strong options back.</p>
        </section>
      ) : (
        <>
          {topPick ? (
            <section className="hero-pick" aria-label="Top recommendation">
              <div className="hero-pick-header">
                <p className="hero-pick-eyebrow">Top pick</p>
                <button
                  type="button"
                  className="hero-pick-badge"
                  onClick={() =>
                    trackEvent("top_pick_clicked", {
                      itemId: topPick.itemId,
                      restaurant: topPick.restaurant.name,
                      calories: topPick.calories,
                    })
                  }
                >
                  Best move right now
                </button>
              </div>
              <div className="hero-pick-row">
                <div>
                  <p className="hero-pick-title">{topPick.itemName}</p>
                  <p className="hero-pick-subtitle">{topPick.restaurant.name}</p>
                </div>
                <p className="hero-pick-calories">{topPick.calories} cal</p>
              </div>
              <p className="hero-pick-why">{topPickWhy}</p>
              <p className="hero-pick-trust">Picked for the best balance of satisfaction, calorie fit, and recommendation quality under your budget.</p>
            </section>
          ) : null}

          <p className="results-section-label">More options</p>

          <section className="results-grid" aria-label="Recommended meals">
            {sortedResults.map((result, index) => (
              <MealCard
                key={result.itemId}
                result={result}
                whyThisWorks={whyMap.get(result.itemId)}
                calorieBudget={calorieBudget}
                displayedRank={index + 1}
                selectedCravings={selectedCravings}
                matchMode={cravingMode}
                sortMode={sort}
                provider={provider}
                onProviderSelected={updateProvider}
              />
            ))}
          </section>
        </>
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
