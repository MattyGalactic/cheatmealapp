"use client";

import { useEffect, useState, type MouseEvent } from "react";
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
};

export function MealCard({
  result,
  whyThisWorks,
  calorieBudget,
  displayedRank,
  selectedCravings,
  matchMode,
  sortMode,
}: MealCardProps) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [providerPickerIntent, setProviderPickerIntent] = useState<"order" | "change" | null>(null);
  const [provider, setProvider] = useState<OrderProvider | null>(null);
  const isPrimaryRecommendation = result.rank === 1;
  const rankPosition = displayedRank ?? result.rank;

  const readStoredProvider = (): OrderProvider | null => {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem("cm_order_provider");
    return value === "doordash" || value === "ubereats" ? value : null;
  };

  const clearStoredProvider = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("cm_order_provider");
  };

  const persistProvider = (nextProvider: OrderProvider) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("cm_order_provider", nextProvider);
  };

  useEffect(() => {
    setProvider(readStoredProvider());
  }, []);

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
      setProviderPickerIntent("order");
      setChooserOpen(true);
      return;
    }

    openOrderForProvider(provider);
  };

  const handleProviderSelect = (nextProvider: OrderProvider) => {
    persistProvider(nextProvider);
    setProvider(nextProvider);
    setChooserOpen(false);
    if (providerPickerIntent === "order") {
      openOrderForProvider(nextProvider);
    }
    setProviderPickerIntent(null);
  };

  const handleChangeProviderClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    emitEvent({
      event_name: "change_provider_clicked",
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

    clearStoredProvider();
    setProvider(null);
    setChooserOpen(false);
    setProviderPickerIntent("change");
    setChooserOpen(true);
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
      {isPrimaryRecommendation ? <p className="recommended-label">Recommended</p> : null}

      <div className="card-top">
        <div className="card-main">
          <p className="item-name">{result.itemName}</p>
          <p className="restaurant-name">{result.restaurant.name}</p>
        </div>

        <div className="card-stats">
          <p className="calories-main">{result.calories} cal</p>
          <p className="protein-main">{result.proteinGrams}g protein</p>
        </div>
      </div>

      <div className="info-block">
        <p className="macro-row">
          Price {typeof result.priceUsd === "number" ? `$${result.priceUsd.toFixed(2)}` : "N/A"}
          <span className="dot">|</span>
          Rank #{result.rank}
          <span className="macro-score">
            <span className="dot">|</span>
            Score {result.score}
          </span>
        </p>
      </div>

      <p className="why">
        <span className="why-label">Why this works:</span> {whyThisWorks ?? result.whyThisWorks}
      </p>

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
          <button type="button" className="link-button" onClick={handleDistanceClick}>
            {result.restaurant.distanceMiles.toFixed(1)} mi
          </button>
        ) : null}
      </div>

      <div className="card-footer">
        <button type="button" className="change-provider-link" onClick={handleChangeProviderClick}>
          Change Provider
        </button>
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
