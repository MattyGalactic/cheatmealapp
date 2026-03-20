"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MealCard } from "./MealCard";
import type { RecommendationSortKey, RecommendationsApiResponse } from "../lib/api";
import type { CravingKey, CravingMatchMode } from "../lib/cravings";
import type { OrderProvider } from "../lib/orderLinks";
import { emitEvent } from "../lib/events";
import { filterByCravings, tagResultsWithCravings } from "../lib/cravings";
import { sortRecommendationResults } from "../lib/resultSort";
import { buildWhyThisWorksMap } from "../lib/whyThisWorks";
import {
  clearLocalSettings,
  DEFAULT_LOCAL_DEFAULTS,
  isValidCravingMode,
  isValidProvider,
  isValidSort,
  parseCravingsParam,
  readLocalSettings,
  writeLocalSettings,
} from "../lib/localSettings";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const searchParams = useSearchParams();

  const taggedResults = tagResultsWithCravings(data.results, calorieBudget);
  const filteredResults = filterByCravings(taggedResults, selectedCravings, cravingMode);
  const sortedResults = sortRecommendationResults(filteredResults, sort);
  const whyMap = buildWhyThisWorksMap(data.results, calorieBudget);
  const topPick = sortedResults[0];
  const topPickWhy = topPick ? whyMap.get(topPick.itemId) ?? topPick.whyThisWorks : null;

  useEffect(() => {
    const settings = readLocalSettings();
    const defaults = settings?.defaults ?? DEFAULT_LOCAL_DEFAULTS;

    const querySort = searchParams.get("sort");
    const queryProvider = searchParams.get("provider");
    const queryCravings = parseCravingsParam(searchParams.get("cravings"));
    const queryMode = searchParams.get("match");

    setSort(isValidSort(querySort) ? querySort : defaults.sort);
    setProvider(isValidProvider(queryProvider) ? queryProvider : defaults.provider);
    setSelectedCravings(queryCravings.length > 0 ? queryCravings : defaults.selectedCravings);
    setCravingMode(isValidCravingMode(queryMode) ? queryMode : defaults.cravingMode);
  }, [searchParams]);

  const updateProvider = (nextProvider: OrderProvider | null) => {
    const previousProvider = provider;
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

  const saveCurrentAsDefaults = () => {
    writeLocalSettings({
      calorieBudget,
      sort,
      provider,
      selectedCravings,
      cravingMode,
    });
    setSettingsOpen(false);
  };

  const resetToSavedDefaults = () => {
    const defaults = readLocalSettings()?.defaults ?? DEFAULT_LOCAL_DEFAULTS;
    setSort(defaults.sort);
    setProvider(defaults.provider);
    setSelectedCravings(defaults.selectedCravings);
    setCravingMode(defaults.cravingMode);
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

        <button type="button" className="cravings-toggle" onClick={() => setSettingsOpen(true)}>
          <span className="filters-text">Settings</span>
        </button>
      </div>

      {settingsOpen ? (
        <div className="local-settings-modal-backdrop" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section
            className="local-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Local defaults"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="local-settings-title">Local defaults</p>
            <p className="local-settings-copy">Saved on this device only. Query params still override saved defaults when present.</p>
            <p className="local-settings-copy">Save your current calorie target, sort, provider, and filters as defaults.</p>
            <div className="local-settings-actions">
              <button type="button" className="link-button" onClick={saveCurrentAsDefaults}>Save as defaults</button>
              <button type="button" className="link-button" onClick={resetToSavedDefaults}>Reset to saved defaults</button>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  clearLocalSettings();
                  setSort(DEFAULT_LOCAL_DEFAULTS.sort);
                  setProvider(DEFAULT_LOCAL_DEFAULTS.provider);
                  setSelectedCravings(DEFAULT_LOCAL_DEFAULTS.selectedCravings);
                  setCravingMode(DEFAULT_LOCAL_DEFAULTS.cravingMode);
                }}
              >
                Clear saved defaults
              </button>
              <button type="button" className="link-button" onClick={() => setSettingsOpen(false)}>Close</button>
            </div>
          </section>
        </div>
      ) : null}

      {cravingsOpen ? (
        <section className="craving-panel" aria-label="Craving filters">
          <div className="craving-panel-header">
            <p className="craving-panel-title">Filters</p>
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
        <section className="status-panel" aria-live="polite" aria-label="No meals found">
          <p className="status-title">No close matches at this calorie target yet.</p>
          <p className="status-copy">Bumping your calories up by 75–150 usually unlocks much better options without blowing the day.</p>
          <div className="status-actions">
            <Link className="link-button" href={`/results?calories=${Math.min(calorieBudget + 100, 2000)}&page=1`}>
              Try {Math.min(calorieBudget + 100, 2000)} calories
            </Link>
            <Link className="link-button" href="/">
              Change target manually
            </Link>
          </div>
        </section>
      ) : filteredResults.length === 0 ? (
        <section className="status-panel" aria-live="polite" aria-label="No craving matches found">
          <p className="status-title">No meals match this filter combo.</p>
          <p className="status-copy">Your current cravings are probably too strict together. Try Match Any or clear one tag.</p>
          <div className="status-actions">
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setCravingMode("any");
                trackFilterChanged({ matchMode: "any" });
              }}
            >
              Switch to Match Any
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setSelectedCravings([]);
                trackFilterChanged({ cravingsSelected: [] });
              }}
            >
              Clear filters
            </button>
          </div>
        </section>
      ) : (
        <>
          {topPick ? (
            <section className="hero-pick" aria-label="Current top recommendation">
              <div className="hero-pick-header">
                <p className="hero-pick-eyebrow">Current best match</p>
              </div>
              <div className="hero-pick-row">
                <div>
                  <p className="hero-pick-title">{topPick.itemName}</p>
                  <p className="hero-pick-subtitle">{topPick.restaurant.name}</p>
                </div>
                <p className="hero-pick-calories">{topPick.calories} cal</p>
              </div>
              <p className="hero-pick-why">{topPickWhy}</p>
              <p className="hero-pick-trust">Based on your selected sort and filters, this currently has the strongest calorie-and-protein balance for your target.</p>
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
          <span className="link-button pagination-end" aria-live="polite">
            You’ve seen all matches for this target
          </span>
        )}
      </nav>
    </>
  );
}
