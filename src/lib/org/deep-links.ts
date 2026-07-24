/** Query param for shareable person deep links (`/?person=<employmentId>`). */
export const PERSON_QUERY_PARAM = "person";

/** Query param to open org chart compare mode (`/app?compare=1`). */
export const COMPARE_QUERY_PARAM = "compare";

/** Org Chart view mode (`/app?view=map`). */
export const VIEW_QUERY_PARAM = "view";

/** Focus a country on the org map (`/app?view=map&country=Singapore`). */
export const COUNTRY_QUERY_PARAM = "country";

/** People directory department filter (`/app/people?department=Marketing`). */
export const DEPARTMENT_QUERY_PARAM = "department";

/**
 * Open a workspace affordance from a deep link (`/app?open=departments`
 * expands the Department filter menu on Org Chart).
 */
export const OPEN_QUERY_PARAM = "open";
export const OPEN_DEPARTMENTS_VALUE = "departments";

/** Read `person` from a `location.search` string (with or without leading `?`). */
export function readPersonIdFromSearch(search: string): string | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get(PERSON_QUERY_PARAM);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** True when search asks the org chart to enter compare mode. */
export function readCompareFlagFromSearch(search: string): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get(COMPARE_QUERY_PARAM);
  return value === "1" || value === "true";
}

/** Read org chart view mode from search (`chart` | `tree` | `map`). */
export function readViewModeFromSearch(
  search: string,
): "chart" | "tree" | "map" | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get(VIEW_QUERY_PARAM)?.trim().toLowerCase();
  if (value === "chart" || value === "tree" || value === "map") return value;
  return null;
}

/** Country focus label/code from search (for map deep links). */
export function readCountryFromSearch(search: string): string | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get(COUNTRY_QUERY_PARAM);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Department filter from People search. */
export function readDepartmentFromSearch(search: string): string | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get(DEPARTMENT_QUERY_PARAM);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** True when search asks Org Chart to open the Department filter menu. */
export function readOpenDepartmentsFromSearch(search: string): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw)
    .get(OPEN_QUERY_PARAM)
    ?.trim()
    .toLowerCase();
  return value === OPEN_DEPARTMENTS_VALUE;
}

/** Org Chart with the Department filter menu open. */
export function orgChartOpenDepartmentsHref(): string {
  const params = new URLSearchParams();
  params.set(OPEN_QUERY_PARAM, OPEN_DEPARTMENTS_VALUE);
  return `/app?${params.toString()}`;
}

/**
 * Build the search string with `compare` set or cleared.
 * Preserves unrelated query params.
 */
export function withCompareSearchParam(
  search: string,
  enabled: boolean,
): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  if (enabled) {
    params.set(COMPARE_QUERY_PARAM, "1");
  } else {
    params.delete(COMPARE_QUERY_PARAM);
  }
  const next = params.toString();
  return next ? `?${next}` : "";
}

/**
 * Build the search string (including `?` when non-empty) with `person` set or cleared.
 * Preserves unrelated query params.
 */
export function withPersonSearchParam(
  search: string,
  personId: string | null,
): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  if (personId?.trim()) {
    params.set(PERSON_QUERY_PARAM, personId.trim());
  } else {
    params.delete(PERSON_QUERY_PARAM);
  }
  const next = params.toString();
  return next ? `?${next}` : "";
}

/** Map deep link: `/app?view=map&country=Singapore`. */
export function mapCountryHref(countryLabel: string): string {
  const params = new URLSearchParams();
  params.set(VIEW_QUERY_PARAM, "map");
  params.set(COUNTRY_QUERY_PARAM, countryLabel.trim());
  return `/app?${params.toString()}`;
}

/** People directory filtered by department. */
export function peopleDepartmentHref(department: string): string {
  const params = new URLSearchParams();
  params.set(DEPARTMENT_QUERY_PARAM, department.trim());
  return `/app/people?${params.toString()}`;
}

/** Absolute share URL for a person on the current origin/path. */
export function personDeepLinkHref(
  origin: string,
  pathname: string,
  personId: string,
): string {
  const path = pathname || "/";
  const search = withPersonSearchParam("", personId);
  return `${origin.replace(/\/$/, "")}${path}${search}`;
}

export type DeepLinkResolution =
  | { status: "none" }
  | { status: "missing"; personId: string }
  | { status: "ok"; personId: string };

/** Resolve a deep-link id against the loaded employment index. */
export function resolvePersonDeepLink(
  personId: string | null,
  knownIds: ReadonlySet<string> | ReadonlyMap<string, unknown>,
): DeepLinkResolution {
  if (!personId) return { status: "none" };
  const has =
    knownIds instanceof Map ? knownIds.has(personId) : knownIds.has(personId);
  if (!has) return { status: "missing", personId };
  return { status: "ok", personId };
}

/**
 * Uncollapse every ancestor on the path to root so `personId` can appear in layout.
 * Collapsed = node's subtree is hidden; ancestors of the target must be expanded.
 */
export function expandCollapsedAncestors(
  personId: string,
  managerIndex: Map<string, { id: string; managerEmploymentId: string | null }>,
  collapsedIds: ReadonlySet<string>,
): Set<string> {
  const next = new Set(collapsedIds);
  let current: string | null = personId;
  const guard = new Set<string>();
  while (current && !guard.has(current)) {
    guard.add(current);
    const entry = managerIndex.get(current);
    const managerId: string | null = entry?.managerEmploymentId ?? null;
    if (managerId) next.delete(managerId);
    current = managerId;
  }
  return next;
}
