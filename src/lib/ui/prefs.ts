import type { ChartDensity } from "@/lib/org/collapse";
import {
  readStoredDensity,
  writeStoredDensity,
} from "@/lib/org/collapse";

export const LIVE_STORAGE_KEY = "acme-org-chart:live-default";

export type AppPrefs = {
  density: ChartDensity;
  liveDefault: boolean;
};

export function readLiveDefault(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LIVE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeLiveDefault(enabled: boolean): void {
  try {
    window.localStorage.setItem(LIVE_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function readAppPrefs(): AppPrefs {
  return {
    density: readStoredDensity(),
    liveDefault: readLiveDefault(),
  };
}

export function writeDensityPref(density: ChartDensity): void {
  writeStoredDensity(density);
}
