/** Query param for shareable person deep links (`/?person=<employmentId>`). */
export const PERSON_QUERY_PARAM = "person";

/** Read `person` from a `location.search` string (with or without leading `?`). */
export function readPersonIdFromSearch(search: string): string | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get(PERSON_QUERY_PARAM);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    const manager = managerIndex.get(current)?.managerEmploymentId ?? null;
    if (manager) next.delete(manager);
    current = manager;
  }
  return next;
}
