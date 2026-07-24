import type { ChartDensity } from "@/lib/org/collapse";
import {
  readStoredDensity,
  writeStoredDensity,
} from "@/lib/org/collapse";

export const LIVE_STORAGE_KEY = "acme-org-chart:live-default";
export const SIDE_PANEL_STORAGE_KEY = "acme-org-chart:side-panel-open";
/** @deprecated Dark mode removed — key kept only to clear legacy values. */
export const THEME_STORAGE_KEY = "acme-org-chart:theme";
export const PREFS_CHANGED_EVENT = "acme-org-chart:prefs-changed";

export type AppPrefs = {
  density: ChartDensity;
  liveDefault: boolean;
  sidePanelOpen: boolean;
};

function emitPrefsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
}

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
    emitPrefsChanged();
  } catch {
    // ignore
  }
}

export function readSidePanelOpen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SIDE_PANEL_STORAGE_KEY);
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export function writeSidePanelOpen(open: boolean): void {
  try {
    window.localStorage.setItem(SIDE_PANEL_STORAGE_KEY, open ? "1" : "0");
    emitPrefsChanged();
  } catch {
    // ignore
  }
}

/** Always light — clears any leftover `html.dark` from earlier builds. */
export function forceLightTheme(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "light";
  try {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readAppPrefs(): AppPrefs {
  return {
    density: readStoredDensity(),
    liveDefault: readLiveDefault(),
    sidePanelOpen: readSidePanelOpen(),
  };
}

export function writeDensityPref(density: ChartDensity): void {
  writeStoredDensity(density);
  emitPrefsChanged();
}
