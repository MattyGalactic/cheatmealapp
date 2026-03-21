"use client";

import { useEffect, useState } from "react";
import { emitEvent } from "../lib/events";

export function LandingSearchForm() {
  const [calories, setCalories] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const queryCalories = Number(params.get("calories"));
    if (Number.isFinite(queryCalories) && queryCalories >= 50 && queryCalories <= 2000) {
      setCalories(String(Math.round(queryCalories)));
      return;
    }

    setCalories("");
  }, []);

  return (
    <form
      action="/results"
      method="get"
      className="form-grid"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const caloriesValue = Number(formData.get("calories"));
        emitEvent({
          event_name: "search_submitted",
          calories_budget: Number.isFinite(caloriesValue) ? Math.round(caloriesValue) : null,
        });
      }}
    >
      <input
        id="calories"
        name="calories"
        type="tel"
        required
        className="input input-italic-placeholder"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Calories"
        value={calories}
        onChange={(event) => setCalories(event.target.value)}
      />
      <button type="submit" className="button">Find My Meal</button>
    </form>
  );
}
