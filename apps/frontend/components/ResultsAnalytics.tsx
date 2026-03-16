"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export function ResultsAnalytics({
  calorieBudget,
  resultCount,
  topPickId,
}: {
  calorieBudget: number;
  resultCount: number;
  topPickId?: string;
}) {
  useEffect(() => {
    trackEvent("results_viewed", {
      calorieBudget,
      resultCount,
      hasTopPick: Boolean(topPickId),
    });
  }, [calorieBudget, resultCount, topPickId]);

  return null;
}
