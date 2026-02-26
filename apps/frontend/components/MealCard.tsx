"use client";

import Link from "next/link";
import { emitEvent } from "../lib/events";

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
};

export function MealCard({ result, whyThisWorks, calorieBudget }: MealCardProps) {
  const mapsQuery = encodeURIComponent(`${result.restaurant.name} ${result.restaurant.address}`);
  const trackResultClick = () => {
    emitEvent({
      event_name: "result_clicked",
      calories_budget: calorieBudget ?? null,
      restaurant_id: result.restaurant.id,
      restaurant_name: result.restaurant.name,
      item_id: result.itemId,
      item_name: result.itemName,
      metadata_json: { rank: result.rank, score: result.score },
    });
  };

  return (
    <article className="card card-clickable" onClick={trackResultClick}>
      <div className="card-top">
        <div>
          <p className="card-title">{result.restaurant.name}</p>
          <p className="card-subtitle">{result.itemName}</p>
        </div>
        <div className="rank-badge">#{result.rank}</div>
      </div>

      <div className="metrics">
        <div className="metric">
          <span className="metric-label">Calories</span>
          <span className="metric-value">{result.calories}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Protein</span>
          <span className="metric-value">{result.proteinGrams}g</span>
        </div>
        <div className="metric">
          <span className="metric-label">Price</span>
          <span className="metric-value">
            {typeof result.priceUsd === "number" ? `$${result.priceUsd.toFixed(2)}` : "N/A"}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Score</span>
          <span className="metric-value">{result.score}</span>
        </div>
      </div>

      <p className="why">
        <span className="why-label">Why this works:</span> {whyThisWorks ?? result.whyThisWorks}
      </p>

      <div className="card-actions">
        <Link
          className="link-button"
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          onClick={(event) => {
            event.stopPropagation();
            emitEvent({
              event_name: "maps_opened",
              calories_budget: calorieBudget ?? null,
              restaurant_id: result.restaurant.id,
              restaurant_name: result.restaurant.name,
              item_id: result.itemId,
              item_name: result.itemName,
              metadata_json: { rank: result.rank },
            });
          }}
        >
          View Restaurant
        </Link>
        {typeof result.restaurant.distanceMiles === "number" ? (
          <span className="link-button" onClick={(event) => event.stopPropagation()}>
            {result.restaurant.distanceMiles.toFixed(1)} mi
          </span>
        ) : null}
      </div>
    </article>
  );
}
