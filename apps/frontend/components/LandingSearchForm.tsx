"use client";

import { useEffect, useState } from "react";
import { emitEvent } from "../lib/events";
import { DEFAULT_LOCAL_DEFAULTS, readLocalSettings } from "../lib/localSettings";

export function LandingSearchForm() {
  const [calories, setCalories] = useState(String(DEFAULT_LOCAL_DEFAULTS.calorieBudget));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const queryCalories = Number(params.get("calories"));
    if (Number.isFinite(queryCalories) && queryCalories >= 50 && queryCalories <= 2000) {
      setCalories(String(Math.round(queryCalories)));
      return;
    }

    const settings = readLocalSettings();
    setCalories(String(settings?.defaults.calorieBudget ?? DEFAULT_LOCAL_DEFAULTS.calorieBudget));
  }, []);

  useEffect(() => {
    const onDefaultsUpdated = (event: Event) => {
      const nextDefaults = (event as CustomEvent<typeof DEFAULT_LOCAL_DEFAULTS>).detail;
      if (!nextDefaults) return;
      setCalories(String(nextDefaults.calorieBudget));
    };

    window.addEventListener("cm:local-defaults-updated", onDefaultsUpdated);
    return () => window.removeEventListener("cm:local-defaults-updated", onDefaultsUpdated);
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
      <label className="label" htmlFor="calories">
        Calories left today
      </label>
      <input
        id="calories"
        name="calories"
        type="tel"
        required
        className="input"
        inputMode="numeric"
        pattern="[0-9]*"
        value={calories}
        onChange={(event) => setCalories(event.target.value)}
      />
      <button type="submit" className="button">Find My Meal</button>
    </form>
  );
}
