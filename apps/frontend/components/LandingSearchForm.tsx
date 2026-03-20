"use client";

import { useEffect, useState } from "react";
import { emitEvent } from "../lib/events";
import { clearLocalSettings, DEFAULT_LOCAL_DEFAULTS, readLocalSettings, writeLocalSettings } from "../lib/localSettings";

export function LandingSearchForm() {
  const [calories, setCalories] = useState(String(DEFAULT_LOCAL_DEFAULTS.calorieBudget));
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const saveCurrentAsDefault = () => {
    const current = Number(calories);
    const existing = readLocalSettings();
    writeLocalSettings({
      ...(existing?.defaults ?? DEFAULT_LOCAL_DEFAULTS),
      calorieBudget: Number.isFinite(current) ? Math.max(50, Math.min(2000, Math.round(current))) : DEFAULT_LOCAL_DEFAULTS.calorieBudget,
    });
    setSettingsOpen(false);
  };

  return (
    <>
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
        <button type="button" className="button secondary" onClick={() => setSettingsOpen(true)}>
          Settings
        </button>
      </form>

      {settingsOpen ? (
        <div className="local-settings-modal-backdrop" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section
            className="local-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search defaults"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="local-settings-title">Search defaults</p>
            <p className="local-settings-copy">Saved on this device only. No account required.</p>
            <p className="local-settings-copy">Use your current calorie value, then save it as the default.</p>
            <div className="local-settings-actions">
              <button type="button" className="link-button" onClick={saveCurrentAsDefault}>Save as defaults</button>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  const settings = readLocalSettings();
                  setCalories(String(settings?.defaults.calorieBudget ?? DEFAULT_LOCAL_DEFAULTS.calorieBudget));
                }}
              >
                Reset to saved defaults
              </button>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  clearLocalSettings();
                  setCalories(String(DEFAULT_LOCAL_DEFAULTS.calorieBudget));
                }}
              >
                Clear saved defaults
              </button>
              <button type="button" className="link-button" onClick={() => setSettingsOpen(false)}>Close</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
