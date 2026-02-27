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
        Calories left today
      </label>
      <input
        id="calories"
        name="calories"
        type="text"
        required
        className="input"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <button type="submit" className="button">Find My Meal</button>
    </form>
  );
}
