/** Soft pastel accents for department strips (Org Mapper / pastel tree cue). */
const PASTELS = [
  "#2a9d8f",
  "#e85d04",
  "#4c6ef5",
  "#ae3ec9",
  "#0ca678",
  "#f08c00",
  "#1971c2",
  "#c2255c",
  "#087f5b",
  "#e8590c",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Stable pastel for a department name; falls back to calm teal. */
export function departmentAccent(department: string | null | undefined): string {
  const key = department?.trim();
  if (!key) return "#2a9d8f";
  return PASTELS[hashString(key.toLocaleLowerCase()) % PASTELS.length]!;
}
