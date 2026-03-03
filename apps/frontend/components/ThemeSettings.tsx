"use client";

import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark";
type AccentPreference = "classic" | "focus" | "balance" | "stealth";

const THEME_KEY = "cm_theme";
const ACCENT_KEY = "cm_accent";

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
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>("dark");
  const [accent, setAccent] = useState<AccentPreference>("classic");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const nextTheme = isThemePreference(savedTheme) ? savedTheme : "dark";
    const savedAccent = window.localStorage.getItem(ACCENT_KEY);
    const nextAccent = isAccentPreference(savedAccent) ? savedAccent : "classic";
    setTheme(nextTheme);
    setAccent(nextAccent);
    applyTheme(nextTheme);
    applyAccent(nextAccent);
  }, []);

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

        <section className="settings-section" aria-label="Appearance">
          <p className="settings-section-title">Appearance</p>
          <label className="settings-option">
            <input
              type="radio"
              name="appearance"
              value="light"
              checked={theme === "light"}
              onChange={() => setAndPersistTheme("light")}
            />
            <span>Light</span>
          </label>
          <label className="settings-option">
            <input
              type="radio"
              name="appearance"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setAndPersistTheme("dark")}
            />
            <span>Dark</span>
          </label>
        </section>

        <section className="settings-section" aria-label="Accent">
          <p className="settings-section-title">Accent</p>
          <label className="settings-option">
            <input
              type="radio"
              name="accent"
              value="classic"
              checked={accent === "classic"}
              onChange={() => setAndPersistAccent("classic")}
            />
            <AccentDot tone={ACCENT_VALUES.classic.accent} selected={accent === "classic"} />
            <span>Classic</span>
          </label>
          <label className="settings-option">
            <input
              type="radio"
              name="accent"
              value="focus"
              checked={accent === "focus"}
              onChange={() => setAndPersistAccent("focus")}
            />
            <AccentDot tone={ACCENT_VALUES.focus.accent} selected={accent === "focus"} />
            <span>Focus</span>
          </label>
          <label className="settings-option">
            <input
              type="radio"
              name="accent"
              value="balance"
              checked={accent === "balance"}
              onChange={() => setAndPersistAccent("balance")}
            />
            <AccentDot tone={ACCENT_VALUES.balance.accent} selected={accent === "balance"} />
            <span>Balance</span>
          </label>
          <label className="settings-option">
            <input
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
      </aside>
    </>
  );
}
