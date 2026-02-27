"use client";

import { useState, type MouseEvent } from "react";
import type { RecommendationSortKey } from "../lib/api";
import type { CravingKey, CravingMatchMode } from "../lib/cravings";
import type { OrderProvider } from "../lib/orderLinks";
import { emitEvent } from "../lib/events";
import { buildGoogleMapsUrl, buildOrderProviderUrl } from "../lib/orderLinks";

type MealCardProps = {
  result: {
    itemId: string;
    rank: number;
    score: number;
    itemName: string;
    calories: number;
    proteinGrams: number;
    carbsGrams?: number;
    fatGrams?: number;
    priceUsd?: number | null;
    whyThisWorks: string;
    restaurant: {
      id: string;
      name: string;
      address: string;
      distanceMiles?: number | null;
      latitude: number;
      longitude: number;
    };
  };
  whyThisWorks?: string;
  calorieBudget?: number;
  displayedRank?: number;
  selectedCravings?: CravingKey[];
  matchMode?: CravingMatchMode;
  sortMode?: RecommendationSortKey;
  provider: OrderProvider | null;
  onProviderSelected: (provider: OrderProvider) => void;
};

export function MealCard({
  result,
  whyThisWorks,
  calorieBudget,
  displayedRank,
  selectedCravings,
  matchMode,
  sortMode,
  provider,
  onProviderSelected,
}: MealCardProps) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const isPrimaryRecommendation = result.rank === 1;
  const rankPosition = displayedRank ?? result.rank;
  const macroParts = [
    typeof result.proteinGrams === "number" ? `${result.proteinGrams}P` : null,
    typeof result.carbsGrams === "number" ? `${result.carbsGrams}C` : null,
    typeof result.fatGrams === "number" ? `${result.fatGrams}F` : null,
  ].filter(Boolean) as string[];

  const getMapsUrl = () =>
    buildGoogleMapsUrl({
      restaurantName: result.restaurant.name,
      address: result.restaurant.address,
      latitude: result.restaurant.latitude,
      longitude: result.restaurant.longitude,
    });

  const trackResultClick = () => {
    emitEvent({
      event_name: "result_selected",
      calories_budget: calorieBudget ?? null,
      restaurant_id: result.restaurant.id,
      restaurant_name: result.restaurant.name,
      item_id: result.itemId,
      item_name: result.itemName,
      rank_position: rankPosition,
      cravings_selected: selectedCravings ?? [],
      match_mode: matchMode ?? null,
      sort_mode: sortMode ?? null,
    });
  };

  const openOrderForProvider = (provider: OrderProvider) => {
    if (typeof window !== "undefined") {
      window.open(buildOrderProviderUrl(provider, result.restaurant.name), "_blank", "noopener,noreferrer");
    }

    emitEvent({
      event_name: "order_clicked",
      calories_budget: calorieBudget ?? null,
      restaurant_id: result.restaurant.id,
      restaurant_name: result.restaurant.name,
      item_id: result.itemId,
      item_name: result.itemName,
      rank_position: rankPosition,
      cravings_selected: selectedCravings ?? [],
      match_mode: matchMode ?? null,
      sort_mode: sortMode ?? null,
      provider,
    });
  };

  const handleOrderClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!provider) {
      setChooserOpen(true);
      return;
    }

    openOrderForProvider(provider);
  };

  const handleProviderSelect = (nextProvider: OrderProvider) => {
    onProviderSelected(nextProvider);
    setChooserOpen(false);
    openOrderForProvider(nextProvider);
  };

  const handleDistanceClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (typeof window !== "undefined") {
      window.open(getMapsUrl(), "_blank", "noopener,noreferrer");
    }

    emitEvent({
      event_name: "distance_clicked",
      calories_budget: calorieBudget ?? null,
      restaurant_id: result.restaurant.id,
      restaurant_name: result.restaurant.name,
      item_id: result.itemId,
      item_name: result.itemName,
      rank_position: rankPosition,
      cravings_selected: selectedCravings ?? [],
      match_mode: matchMode ?? null,
      sort_mode: sortMode ?? null,
    });
  };

  return (
    <article
      className={`card card-clickable${isPrimaryRecommendation ? " card-primary" : ""}`}
      onClick={trackResultClick}
    >
      {isPrimaryRecommendation ? <p className="recommended-label">RECOMMENDED</p> : null}

      <div className="card-top">
        <div className="card-main">
          <p className="item-name">{result.itemName}</p>
          <p className="restaurant-name">{result.restaurant.name}</p>
        </div>

        <div className="card-stats">
          <p className="calories-main">{result.calories} cal</p>
          {macroParts.length > 0 ? <p className="protein-main">{macroParts.join(" · ")}</p> : null}
        </div>
      </div>

      <div className="info-block">
        <p className="macro-row">
          <span className="macro-label">Reliability</span>
          <span className="macro-divider">&middot;</span>
          <span className="macro-value">{result.score}</span>
        </p>
      </div>

      <p className="why">{whyThisWorks ?? result.whyThisWorks}</p>

      <div className="card-footer">
        <div className="card-actions">
          <button type="button" className="link-button cta-primary" onClick={handleOrderClick}>
            {provider ? (
              <span className="provider-icon" aria-hidden="true">
                {provider === "doordash" ? (
                  <svg viewBox="0 0 24 24" className="provider-svg">
                    <path d="M3 8h8.8l3.2 4-3.2 4H3l3.2-4L3 8z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="provider-svg">
                    <path d="M4 9c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v6c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V9zm5.2 1.5h1.6v1.7h2.4v-1.7h1.6V15h-1.6v-1.6h-2.4V15H9.2v-4.5z" fill="currentColor" />
                  </svg>
                )}
              </span>
            ) : null}
            Order
          </button>

          {typeof result.restaurant.distanceMiles === "number" ? (
            <button type="button" className="link-button cta-secondary" onClick={handleDistanceClick}>
              <span className="distance-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" className="distance-svg">
                  <path
                    d="M8 1.5a4.25 4.25 0 0 0-4.25 4.25c0 3.02 3.1 6.73 4.25 7.97 1.15-1.24 4.25-4.95 4.25-7.97A4.25 4.25 0 0 0 8 1.5Zm0 5.8a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              {result.restaurant.distanceMiles.toFixed(1)} mi
            </button>
          ) : null}
        </div>
      </div>

      {chooserOpen ? (
        <div className="order-chooser" role="dialog" aria-label="Choose delivery provider">
          <button
            type="button"
            className="chooser-option"
            onClick={(event) => {
              event.stopPropagation();
              handleProviderSelect("doordash");
            }}
          >
            DoorDash
          </button>
          <button
            type="button"
            className="chooser-option"
            onClick={(event) => {
              event.stopPropagation();
              handleProviderSelect("ubereats");
            }}
          >
            Uber Eats
          </button>
        </div>
      ) : null}
    </article>
  );
}

