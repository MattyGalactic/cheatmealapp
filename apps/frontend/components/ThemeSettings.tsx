"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { RecommendationSortKey } from "../lib/api";
import type { CravingKey, CravingMatchMode } from "../lib/cravings";
import type { OrderProvider } from "../lib/orderLinks";
import { clearLocalSettings, DEFAULT_LOCAL_DEFAULTS, readLocalSettings, writeLocalSettings } from "../lib/localSettings";

type ThemePreference = "light" | "dark";
type AccentPreference = "classic" | "focus" | "balance" | "stealth";

const THEME_KEY = "cm_theme";
const ACCENT_KEY = "cm_accent";

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

const ACCENT_VALUES: Record<AccentPreference, { accent: string; h: string; s: string; l: string; glowLight: string; glowDark: string }> = {
  classic: { accent: "16.0396039604 100% 60.3921568627%", h: "34", s: "62%", l: "52%", glowLight: "0.05", glowDark: "0.11" },
  focus: { accent: "217 55% 40%", h: "217", s: "55%", l: "40%", glowLight: "0.045", glowDark: "0.1" },
  balance: { accent: "152 34% 38%", h: "152", s: "34%", l: "38%", glowLight: "0.04", glowDark: "0.09" },
  stealth: { accent: "220 8% 26%", h: "220", s: "8%", l: "26%", glowLight: "0.03", glowDark: "0.06" },
};

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark";
}

function isAccentPreference(value: string | null): value is AccentPreference {
  return value === "classic" || value === "focus" || value === "balance" || value === "stealth";
}

function applyTheme(theme: ThemePreference) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const shouldUseDark = theme === "dark";
  root.classList.toggle("dark", shouldUseDark);
}

function applyAccent(accent: AccentPreference) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const resolved = ACCENT_VALUES[accent];
  root.style.setProperty("--accent", resolved.accent);
  root.style.setProperty("--accent-h", resolved.h);
  root.style.setProperty("--accent-s", resolved.s);
  root.style.setProperty("--accent-l", resolved.l);
  root.style.setProperty("--accent-glow-alpha-light", resolved.glowLight);
  root.style.setProperty("--accent-glow-alpha-dark", resolved.glowDark);
}

function AccentDot({ tone, selected }: { tone: string; selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`settings-accent-dot${selected ? " selected" : ""}`}
      style={{ backgroundColor: `hsl(${tone})` }}
    />
  );
}

export function ThemeSettings() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>("dark");
  const [accent, setAccent] = useState<AccentPreference>("classic");
  const [defaultsDraft, setDefaultsDraft] = useState({ ...DEFAULT_LOCAL_DEFAULTS });

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const nextTheme = isThemePreference(savedTheme) ? savedTheme : "dark";
    const savedAccent = window.localStorage.getItem(ACCENT_KEY);
    const nextAccent = isAccentPreference(savedAccent) ? savedAccent : "classic";
    setTheme(nextTheme);
    setAccent(nextAccent);
    applyTheme(nextTheme);
    applyAccent(nextAccent);
    setDefaultsDraft(readLocalSettings()?.defaults ?? DEFAULT_LOCAL_DEFAULTS);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.toggle("settings-open", open);
    body.classList.toggle("settings-open", open);

    return () => {
      root.classList.remove("settings-open");
      body.classList.remove("settings-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const setAndPersistTheme = (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  const setAndPersistAccent = (nextAccent: AccentPreference) => {
    setAccent(nextAccent);
    window.localStorage.setItem(ACCENT_KEY, nextAccent);
    applyAccent(nextAccent);
  };

  const publishDefaultsUpdate = (nextDefaults: typeof DEFAULT_LOCAL_DEFAULTS) => {
    window.dispatchEvent(new CustomEvent("cm:local-defaults-updated", { detail: nextDefaults }));
  };

  const saveDefaults = () => {
    const saved = writeLocalSettings(defaultsDraft).defaults;
    setDefaultsDraft(saved);
    publishDefaultsUpdate(saved);
  };

  const resetToSaved = () => {
    const saved = readLocalSettings()?.defaults ?? DEFAULT_LOCAL_DEFAULTS;
    setDefaultsDraft(saved);
    publishDefaultsUpdate(saved);
  };

  const clearDefaults = () => {
    clearLocalSettings();
    setDefaultsDraft(DEFAULT_LOCAL_DEFAULTS);
    publishDefaultsUpdate(DEFAULT_LOCAL_DEFAULTS);
  };

  return (
    <>
      <div className="settings-header">
        <button
          type="button"
          className="settings-gear"
          aria-label="Open settings"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="currentColor"
              d="M12 8.8a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 0 0 0-6.4Zm9.2 3.2l-2 .6c-.1.4-.2.8-.4 1.2l1.1 1.7a.8.8 0 0 1-.1 1l-1.3 1.3a.8.8 0 0 1-1 .1l-1.7-1.1c-.4.2-.8.3-1.2.4l-.6 2a.8.8 0 0 1-.8.6h-1.8a.8.8 0 0 1-.8-.6l-.6-2c-.4-.1-.8-.2-1.2-.4l-1.7 1.1a.8.8 0 0 1-1-.1l-1.3-1.3a.8.8 0 0 1-.1-1l1.1-1.7c-.2-.4-.3-.8-.4-1.2l-2-.6a.8.8 0 0 1-.6-.8v-1.8a.8.8 0 0 1 .6-.8l2-.6c.1-.4.2-.8.4-1.2L4 7a.8.8 0 0 1 .1-1l1.3-1.3a.8.8 0 0 1 1-.1l1.7 1.1c.4-.2.8-.3 1.2-.4l.6-2a.8.8 0 0 1 .8-.6h1.8a.8.8 0 0 1 .8.6l.6 2c.4.1.8.2 1.2.4l1.7-1.1a.8.8 0 0 1 1 .1L20 6a.8.8 0 0 1 .1 1l-1.1 1.7c.2.4.3.8.4 1.2l2 .6a.8.8 0 0 1 .6.8v1.8a.8.8 0 0 1-.8.8Z"
            />
          </svg>
        </button>
      </div>

      <div
        className={`settings-overlay${open ? " open" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <aside className={`settings-panel${open ? " open" : ""}`} aria-label="Settings panel">
        <div className="settings-panel-header">
          <p className="settings-title">Settings</p>
          <button type="button" className="settings-close" aria-label="Close settings" onClick={() => setOpen(false)}>
            X
          </button>
        </div>

        <div className="settings-panel-body">
        <section className="settings-section" aria-label="Appearance">
          <p className="settings-section-title">Appearance</p>
          <label className={`settings-option settings-row${theme === "light" ? " selected" : ""}`}>
            <input
              className="settings-radio"
              type="radio"
              name="appearance"
              value="light"
              checked={theme === "light"}
              onChange={() => setAndPersistTheme("light")}
            />
            <span className="settings-row-check" aria-hidden="true">
              {theme === "light" ? "✓" : ""}
            </span>
            <span>Light</span>
          </label>
          <label className={`settings-option settings-row${theme === "dark" ? " selected" : ""}`}>
            <input
              className="settings-radio"
              type="radio"
              name="appearance"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setAndPersistTheme("dark")}
            />
            <span className="settings-row-check" aria-hidden="true">
              {theme === "dark" ? "✓" : ""}
            </span>
            <span>Dark</span>
          </label>
        </section>

        <section className="settings-section" aria-label="Accent">
          <p className="settings-section-title">Accent</p>
          <label className={`settings-option settings-row settings-accent-row${accent === "classic" ? " selected" : ""}`}>
            <input
              className="settings-radio"
              type="radio"
              name="accent"
              value="classic"
              checked={accent === "classic"}
              onChange={() => setAndPersistAccent("classic")}
            />
            <AccentDot tone={ACCENT_VALUES.classic.accent} selected={accent === "classic"} />
            <span>Classic</span>
          </label>
          <label className={`settings-option settings-row settings-accent-row${accent === "focus" ? " selected" : ""}`}>
            <input
              className="settings-radio"
              type="radio"
              name="accent"
              value="focus"
              checked={accent === "focus"}
              onChange={() => setAndPersistAccent("focus")}
            />
            <AccentDot tone={ACCENT_VALUES.focus.accent} selected={accent === "focus"} />
            <span>Focus</span>
          </label>
          <label className={`settings-option settings-row settings-accent-row${accent === "balance" ? " selected" : ""}`}>
            <input
              className="settings-radio"
              type="radio"
              name="accent"
              value="balance"
              checked={accent === "balance"}
              onChange={() => setAndPersistAccent("balance")}
            />
            <AccentDot tone={ACCENT_VALUES.balance.accent} selected={accent === "balance"} />
            <span>Balance</span>
          </label>
          <label className={`settings-option settings-row settings-accent-row${accent === "stealth" ? " selected" : ""}`}>
            <input
              className="settings-radio"
              type="radio"
              name="accent"
              value="stealth"
              checked={accent === "stealth"}
              onChange={() => setAndPersistAccent("stealth")}
            />
            <AccentDot tone={ACCENT_VALUES.stealth.accent} selected={accent === "stealth"} />
            <span>Stealth</span>
          </label>
        </section>

        <section className="settings-section" aria-label="Local defaults">
          <p className="settings-section-title">Local defaults</p>
          <p className="local-settings-inline-copy">
            Saved on this device only for filters and display preferences.{pathname?.startsWith("/results") ? " Query params still override saved defaults when present." : ""}
          </p>

          <label className="label" htmlFor="settings-sort">Default sort</label>
          <select
            id="settings-sort"
            className="select settings-inline-select"
            value={defaultsDraft.sort}
            onChange={(event) => setDefaultsDraft((current) => ({ ...current, sort: event.target.value as RecommendationSortKey }))}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <label className="label" htmlFor="settings-provider">Default provider</label>
          <select
            id="settings-provider"
            className="select settings-inline-select"
            value={defaultsDraft.provider ?? ""}
            onChange={(event) => {
              const next = event.target.value;
              setDefaultsDraft((current) => ({
                ...current,
                provider: next === "doordash" || next === "ubereats" ? next : null,
              }));
            }}
          >
            <option value="">No preference</option>
            <option value="doordash">DoorDash</option>
            <option value="ubereats">Uber Eats</option>
          </select>

          <p className="label settings-inline-label">Default cravings</p>
          <div className="chip-wrap settings-inline-chips">
            {CRAVING_OPTIONS.map((craving) => {
              const selected = defaultsDraft.selectedCravings.includes(craving);
              return (
                <button
                  key={craving}
                  type="button"
                  className={`chip${selected ? " selected" : ""}`}
                  onClick={() => {
                    setDefaultsDraft((current) => ({
                      ...current,
                      selectedCravings: selected
                        ? current.selectedCravings.filter((value) => value !== craving)
                        : [...current.selectedCravings, craving],
                    }));
                  }}
                >
                  {craving}
                </button>
              );
            })}
          </div>

          <div className="mode-toggle" role="group" aria-label="Default craving match mode">
            <button
              type="button"
              className={`mode-option${defaultsDraft.cravingMode === "all" ? " active" : ""}`}
              onClick={() => setDefaultsDraft((current) => ({ ...current, cravingMode: "all" }))}
            >
              Match All
            </button>
            <button
              type="button"
              className={`mode-option${defaultsDraft.cravingMode === "any" ? " active" : ""}`}
              onClick={() => setDefaultsDraft((current) => ({ ...current, cravingMode: "any" }))}
            >
              Match Any
            </button>
          </div>

          <div className="local-settings-actions settings-inline-actions">
            <button type="button" className="link-button" onClick={saveDefaults}>Save defaults</button>
            <button type="button" className="link-button" onClick={resetToSaved}>Reset to saved defaults</button>
            <button type="button" className="link-button" onClick={clearDefaults}>Clear saved defaults</button>
          </div>
        </section>
        </div>
      </aside>
    </>
  );
}
