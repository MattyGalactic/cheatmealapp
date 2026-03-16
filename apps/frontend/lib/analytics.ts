"use client";

import { track } from "@vercel/analytics";

export function trackEvent(name: string, properties?: Record<string, string | number | boolean | null | undefined>) {
  try {
    track(name, properties);
  } catch {
    // no-op; analytics should never break product flow
  }
}
