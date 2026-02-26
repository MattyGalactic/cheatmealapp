const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const SESSION_STORAGE_KEY = "cm_session_id";

export type ClientEventName = "search_submitted" | "result_clicked" | "maps_opened";

export type ClientEventPayload = {
  event_name: ClientEventName;
  session_id?: string;
  calories_budget?: number | null;
  restaurant_id?: string | null;
  restaurant_name?: string | null;
  item_id?: string | null;
  item_name?: string | null;
  metadata_json?: Record<string, unknown> | null;
};

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `cm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateSessionId(): string {
  if (!canUseBrowserStorage()) {
    return generateSessionId();
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const created = generateSessionId();
  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function emitEvent(payload: ClientEventPayload): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    ...payload,
    session_id: payload.session_id ?? getOrCreateSessionId(),
  });

  const url = `${API_BASE}/api/events`;

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(url, blob);
    return;
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Intentionally swallow analytics failures for MVP UX.
  });
}
