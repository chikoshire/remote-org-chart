"use client";

import { useEffect } from "react";
import { forceLightTheme } from "@/lib/ui/prefs";

/** Locks the product to light mode and clears legacy dark preference. */
export function ThemeBootstrap() {
  useEffect(() => {
    forceLightTheme();
  }, []);
  return null;
}
