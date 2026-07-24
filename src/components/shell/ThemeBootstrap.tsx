"use client";

import { useEffect } from "react";
import { applyThemeClass, readThemePref } from "@/lib/ui/prefs";

/** Applies persisted light/dark preference on first paint of client trees. */
export function ThemeBootstrap() {
  useEffect(() => {
    applyThemeClass(readThemePref());
  }, []);
  return null;
}
