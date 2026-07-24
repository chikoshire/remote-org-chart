/**
 * Pastel department accents — wider set so sibling teams stay distinguishable.
 */
const PASTELS = [
  "#9b8ec4", // lavender
  "#6aae96", // mint
  "#d4a05a", // peach-gold
  "#6a9ec4", // sky
  "#c48aa0", // rose
  "#8a9eb0", // cool gray-blue
  "#c4a88e", // warm sand
  "#7eb8a8", // seafoam
  "#b09ec9", // soft violet
  "#d4b06a", // soft gold
  "#8eb4c9", // powder blue
  "#c49aa8", // dusty rose
] as const;

const FALLBACK = "#8a8580";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Stable pastel accent for a department name. */
export function departmentAccent(department: string | null | undefined): string {
  const key = department?.trim();
  if (!key) return FALLBACK;
  return PASTELS[hashString(key.toLocaleLowerCase()) % PASTELS.length]!;
}

/** Unique department accent colours for a set of people (stable name order). */
export function departmentAccentsForPeople(
  people: Array<{ department?: string | null }>,
): string[] {
  const byKey = new Map<string, { label: string; color: string }>();
  for (const person of people) {
    const label = person.department?.trim();
    if (!label) continue;
    const key = label.toLocaleLowerCase();
    if (byKey.has(key)) continue;
    byKey.set(key, { label, color: departmentAccent(label) });
  }
  return [...byKey.values()]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((entry) => entry.color);
}

/** Chart bar / progress accent — single quiet black, not a rainbow. */
export const CHART_BAR_ACCENT = "#121212";
