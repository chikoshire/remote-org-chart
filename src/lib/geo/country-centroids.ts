/** Approximate country centroids for org map pins (lat, lng). */

export type CountryCentroid = {
  code: string;
  lat: number;
  lng: number;
};

const CENTROIDS: Record<string, { lat: number; lng: number }> = {
  USA: { lat: 39.8, lng: -98.5 },
  US: { lat: 39.8, lng: -98.5 },
  CAN: { lat: 56.1, lng: -106.3 },
  CA: { lat: 56.1, lng: -106.3 },
  MEX: { lat: 23.6, lng: -102.5 },
  MX: { lat: 23.6, lng: -102.5 },
  BRA: { lat: -14.2, lng: -51.9 },
  BR: { lat: -14.2, lng: -51.9 },
  ARG: { lat: -38.4, lng: -63.6 },
  AR: { lat: -38.4, lng: -63.6 },
  GBR: { lat: 54.7, lng: -2.9 },
  GB: { lat: 54.7, lng: -2.9 },
  UK: { lat: 54.7, lng: -2.9 },
  IRL: { lat: 53.1, lng: -8.0 },
  IE: { lat: 53.1, lng: -8.0 },
  FRA: { lat: 46.2, lng: 2.2 },
  FR: { lat: 46.2, lng: 2.2 },
  DEU: { lat: 51.2, lng: 10.4 },
  DE: { lat: 51.2, lng: 10.4 },
  ESP: { lat: 40.5, lng: -3.7 },
  ES: { lat: 40.5, lng: -3.7 },
  PRT: { lat: 39.4, lng: -8.2 },
  PT: { lat: 39.4, lng: -8.2 },
  NLD: { lat: 52.1, lng: 5.3 },
  NL: { lat: 52.1, lng: 5.3 },
  BEL: { lat: 50.5, lng: 4.5 },
  BE: { lat: 50.5, lng: 4.5 },
  CHE: { lat: 46.8, lng: 8.2 },
  CH: { lat: 46.8, lng: 8.2 },
  ITA: { lat: 41.9, lng: 12.6 },
  IT: { lat: 41.9, lng: 12.6 },
  POL: { lat: 51.9, lng: 19.1 },
  PL: { lat: 51.9, lng: 19.1 },
  SWE: { lat: 60.1, lng: 18.6 },
  SE: { lat: 60.1, lng: 18.6 },
  NOR: { lat: 60.5, lng: 8.5 },
  NO: { lat: 60.5, lng: 8.5 },
  DNK: { lat: 56.3, lng: 9.5 },
  DK: { lat: 56.3, lng: 9.5 },
  FIN: { lat: 61.9, lng: 25.7 },
  FI: { lat: 61.9, lng: 25.7 },
  AUT: { lat: 47.5, lng: 14.6 },
  AT: { lat: 47.5, lng: 14.6 },
  CZE: { lat: 49.8, lng: 15.5 },
  CZ: { lat: 49.8, lng: 15.5 },
  ROU: { lat: 45.9, lng: 24.9 },
  RO: { lat: 45.9, lng: 24.9 },
  HUN: { lat: 47.2, lng: 19.5 },
  HU: { lat: 47.2, lng: 19.5 },
  GRC: { lat: 39.1, lng: 21.8 },
  GR: { lat: 39.1, lng: 21.8 },
  TUR: { lat: 38.9, lng: 35.2 },
  TR: { lat: 38.9, lng: 35.2 },
  UKR: { lat: 48.4, lng: 31.2 },
  UA: { lat: 48.4, lng: 31.2 },
  RUS: { lat: 61.5, lng: 105.3 },
  RU: { lat: 61.5, lng: 105.3 },
  IND: { lat: 20.6, lng: 79.0 },
  IN: { lat: 20.6, lng: 79.0 },
  CHN: { lat: 35.9, lng: 104.2 },
  CN: { lat: 35.9, lng: 104.2 },
  JPN: { lat: 36.2, lng: 138.3 },
  JP: { lat: 36.2, lng: 138.3 },
  KOR: { lat: 35.9, lng: 127.8 },
  KR: { lat: 35.9, lng: 127.8 },
  SGP: { lat: 1.4, lng: 103.8 },
  SG: { lat: 1.4, lng: 103.8 },
  HKG: { lat: 22.3, lng: 114.2 },
  HK: { lat: 22.3, lng: 114.2 },
  TWN: { lat: 23.7, lng: 121.0 },
  TW: { lat: 23.7, lng: 121.0 },
  THA: { lat: 15.9, lng: 100.9 },
  TH: { lat: 15.9, lng: 100.9 },
  VNM: { lat: 14.1, lng: 108.3 },
  VN: { lat: 14.1, lng: 108.3 },
  IDN: { lat: -0.8, lng: 113.9 },
  ID: { lat: -0.8, lng: 113.9 },
  PHL: { lat: 12.9, lng: 121.8 },
  PH: { lat: 12.9, lng: 121.8 },
  MYS: { lat: 4.2, lng: 101.9 },
  MY: { lat: 4.2, lng: 101.9 },
  AUS: { lat: -25.3, lng: 133.8 },
  AU: { lat: -25.3, lng: 133.8 },
  NZL: { lat: -40.9, lng: 174.9 },
  NZ: { lat: -40.9, lng: 174.9 },
  ZAF: { lat: -30.6, lng: 22.9 },
  ZA: { lat: -30.6, lng: 22.9 },
  NGA: { lat: 9.1, lng: 8.7 },
  NG: { lat: 9.1, lng: 8.7 },
  KEN: { lat: 0.0, lng: 37.9 },
  KE: { lat: 0.0, lng: 37.9 },
  EGY: { lat: 26.8, lng: 30.8 },
  EG: { lat: 26.8, lng: 30.8 },
  ARE: { lat: 23.4, lng: 53.8 },
  AE: { lat: 23.4, lng: 53.8 },
  SAU: { lat: 23.9, lng: 45.1 },
  SA: { lat: 23.9, lng: 45.1 },
  ISR: { lat: 31.0, lng: 34.9 },
  IL: { lat: 31.0, lng: 34.9 },
  COL: { lat: 4.6, lng: -74.3 },
  CO: { lat: 4.6, lng: -74.3 },
  CHL: { lat: -35.7, lng: -71.5 },
  CL: { lat: -35.7, lng: -71.5 },
  PER: { lat: -9.2, lng: -75.0 },
  PE: { lat: -9.2, lng: -75.0 },
};

export function countryCentroid(code: string | null | undefined): CountryCentroid | null {
  if (!code?.trim()) return null;
  const key = code.trim().toUpperCase();
  const hit = CENTROIDS[key];
  if (!hit) return null;
  return { code: key, lat: hit.lat, lng: hit.lng };
}

/** Equirectangular projection into 0–100% of a map frame. */
export function projectToMapPercent(lat: number, lng: number): {
  x: number;
  y: number;
} {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return {
    x: Math.min(98, Math.max(2, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}
