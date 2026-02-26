"use client";

import { emitEvent } from "../lib/events";

export function LandingSearchForm() {
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
      <label className="label" htmlFor="calories">
        Remaining Calories
      </label>
      <input
        id="calories"
        name="calories"
        type="number"
        min={50}
        max={2000}
        required
        defaultValue={400}
        className="input"
        inputMode="numeric"
      />
      <button type="submit" className="button">Find My Meal</button>
    </form>
  );
}

