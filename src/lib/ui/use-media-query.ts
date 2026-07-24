"use client";

import { useEffect, useState } from "react";

/** True when viewport is below the given max-width breakpoint (default: Tailwind `md`). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const MOBILE_MAX_WIDTH = "(max-width: 767px)";
