"use client";

import { useEffect } from "react";

/**
 * Warm the KV org-chart snapshot while visitors read the marketing page so
 * the first authenticated load is usually a cache hit (cold Remote rebuilds
 * fan out ~149 employment detail GETs).
 */
export function OrgChartPrefetch() {
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/org-chart", {
      signal: controller.signal,
      cache: "no-store",
    }).catch(() => {
      // Best-effort warm; ignore network / abort.
    });
    return () => controller.abort();
  }, []);

  return null;
}
