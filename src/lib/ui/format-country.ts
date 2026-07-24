/** ISO-ish country codes → friendly labels for UI. */
const COUNTRY_LABELS: Record<string, string> = {
  USA: "United States",
  US: "United States",
  GBR: "United Kingdom",
  GB: "United Kingdom",
  UK: "United Kingdom",
  CAN: "Canada",
  CA: "Canada",
  DEU: "Germany",
  DE: "Germany",
  FRA: "France",
  FR: "France",
  NLD: "Netherlands",
  NL: "Netherlands",
  IRL: "Ireland",
  IE: "Ireland",
  ESP: "Spain",
  ES: "Spain",
  PRT: "Portugal",
  PT: "Portugal",
  AUS: "Australia",
  AU: "Australia",
  BRA: "Brazil",
  BR: "Brazil",
  IND: "India",
  IN: "India",
  SGP: "Singapore",
  SG: "Singapore",
  ARE: "United Arab Emirates",
  AE: "United Arab Emirates",
  HKG: "Hong Kong",
  HK: "Hong Kong",
  JPN: "Japan",
  JP: "Japan",
  MEX: "Mexico",
  MX: "Mexico",
  ITA: "Italy",
  IT: "Italy",
  POL: "Poland",
  PL: "Poland",
  SWE: "Sweden",
  SE: "Sweden",
  CHE: "Switzerland",
  CH: "Switzerland",
  NZL: "New Zealand",
  NZ: "New Zealand",
  ZAF: "South Africa",
  ZA: "South Africa",
  PHL: "Philippines",
  PH: "Philippines",
};

export function formatCountryLabel(
  code: string | null | undefined,
): string | null {
  if (!code?.trim()) return null;
  const key = code.trim().toUpperCase();
  return COUNTRY_LABELS[key] ?? code.trim();
}

/**
 * Map a dashboard label or ISO code onto a known employment country code.
 * Prefers exact code match, then full-name match against known codes.
 */
export function resolveCountryCode(
  needle: string | null | undefined,
  knownCodes: readonly string[],
): string | null {
  if (!needle?.trim() || knownCodes.length === 0) return null;
  const trimmed = needle.trim();
  const upper = trimmed.toUpperCase();
  const byCode = knownCodes.find((code) => code.toUpperCase() === upper);
  if (byCode) return byCode;

  const lower = trimmed.toLowerCase();
  for (const code of knownCodes) {
    const label = formatCountryLabel(code);
    if (label?.toLowerCase() === lower) return code;
  }

  for (const [code, label] of Object.entries(COUNTRY_LABELS)) {
    if (label.toLowerCase() !== lower) continue;
    const known = knownCodes.find((c) => c.toUpperCase() === code);
    if (known) return known;
  }

  return null;
}

/** Sort country codes by display label (full name), not raw ISO. */
export function sortCountryCodesByLabel(codes: readonly string[]): string[] {
  return [...codes].sort((a, b) => {
    const la = formatCountryLabel(a) || a;
    const lb = formatCountryLabel(b) || b;
    return la.localeCompare(lb);
  });
}
