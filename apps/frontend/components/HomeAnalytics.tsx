"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export function HomeAnalytics() {
  useEffect(() => {
    trackEvent("homepage_viewed");
  }, []);

  return null;
}
