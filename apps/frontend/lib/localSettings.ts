import type { RecommendationSortKey } from "./api";
import type { CravingKey, CravingMatchMode } from "./cravings";
import type { OrderProvider } from "./orderLinks";

const SETTINGS_KEY = "cm_settings";
const SETTINGS_VERSION = 1;

const SORT_VALUES: RecommendationSortKey[] = ["best_match", "highest_protein", "lowest_calories", "restaurant"];
const CRAVING_VALUES: CravingKey[] = [
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

export type LocalDefaultsV1 = {
  sort: RecommendationSortKey;
  provider: OrderProvider | null;
  selectedCravings: CravingKey[];
  cravingMode: CravingMatchMode;
};

export type LocalSettingsV1 = {
  version: 1;
  defaults: LocalDefaultsV1;
};

export const DEFAULT_LOCAL_DEFAULTS: LocalDefaultsV1 = {
  sort: "best_match",
  provider: null,
  selectedCravings: [],
  cravingMode: "all",
};

function sanitizeSort(value: unknown): RecommendationSortKey {
  return SORT_VALUES.includes(value as RecommendationSortKey)
    ? (value as RecommendationSortKey)
    : DEFAULT_LOCAL_DEFAULTS.sort;
}

function sanitizeProvider(value: unknown): OrderProvider | null {
  return value === "doordash" || value === "ubereats" ? value : null;
}

function sanitizeCravings(value: unknown): CravingKey[] {
  if (!Array.isArray(value)) return [];
  const unique = new Set<CravingKey>();
  for (const item of value) {
    if (CRAVING_VALUES.includes(item as CravingKey)) unique.add(item as CravingKey);
  }
  return Array.from(unique);
}

function sanitizeCravingMode(value: unknown): CravingMatchMode {
  return value === "all" || value === "any" ? value : DEFAULT_LOCAL_DEFAULTS.cravingMode;
}

function sanitizeDefaults(value: unknown): LocalDefaultsV1 {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_LOCAL_DEFAULTS };
  }

  const raw = value as Partial<LocalDefaultsV1>;

  return {
    sort: sanitizeSort(raw.sort),
    provider: sanitizeProvider(raw.provider),
    selectedCravings: sanitizeCravings(raw.selectedCravings),
    cravingMode: sanitizeCravingMode(raw.cravingMode),
  };
}

export function readLocalSettings(): LocalSettingsV1 | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<LocalSettingsV1>;
    if (parsed.version !== SETTINGS_VERSION) return null;

    return {
      version: SETTINGS_VERSION,
      defaults: sanitizeDefaults(parsed.defaults),
    };
  } catch {
    return null;
  }
}

export function writeLocalSettings(defaults: LocalDefaultsV1): LocalSettingsV1 {
  const next: LocalSettingsV1 = {
    version: SETTINGS_VERSION,
    defaults: sanitizeDefaults(defaults),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  return next;
}

export function clearLocalSettings(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SETTINGS_KEY);
  }
}

export function isValidSort(value: string | null): value is RecommendationSortKey {
  return !!value && SORT_VALUES.includes(value as RecommendationSortKey);
}

export function isValidProvider(value: string | null): value is OrderProvider {
  return value === "doordash" || value === "ubereats";
}

export function isValidCravingMode(value: string | null): value is CravingMatchMode {
  return value === "all" || value === "any";
}

export function parseCravingsParam(value: string | null): CravingKey[] {
  if (!value) return [];
  const cravings = value
    .split(",")
    .map((part) => decodeURIComponent(part.trim()))
    .filter(Boolean);

  return sanitizeCravings(cravings);
}
