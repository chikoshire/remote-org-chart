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
};

export function formatCountryLabel(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  const key = code.trim().toUpperCase();
  return COUNTRY_LABELS[key] ?? code.trim();
}
