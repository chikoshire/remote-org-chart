/**
 * Restrained department accents — Prussian / Spray family only.
 * Color differentiates lightly without a cartoon rainbow.
 */
const MUTED = [
  "#0b2a32", // Prussian
  "#1a4550",
  "#245a52", // Spray-leaning
  "#2f6570",
  "#164038",
  "#3a6b75",
] as const;

const FALLBACK = "#0b2a32";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Stable muted accent for a department name; falls back to Prussian. */
export function departmentAccent(department: string | null | undefined): string {
  const key = department?.trim();
  if (!key) return FALLBACK;
  return MUTED[hashString(key.toLocaleLowerCase()) % MUTED.length]!;
}

/** Brand bar color for charts — one accent, not a rainbow. */
export const CHART_BAR_ACCENT = "#e85d04";
