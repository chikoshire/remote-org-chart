/** Local person field overlays (fallback when Remote rejects a write). */

import { buildOrgForest, flattenOrgForest } from "@/lib/org/build-forest";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";
import type { EmploymentRecord } from "@/lib/remote/employment-schema";

export const PERSON_OVERRIDES_STORAGE_KEY = "acme-org-chart:person-overrides";
export const PERSON_OVERRIDES_CHANGED_EVENT =
  "acme-org-chart:person-overrides-changed";

export type PersonOverride = {
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  /** Explicit null clears manager (makes the person a root). */
  managerEmploymentId?: string | null;
};

export type PersonOverridesMap = Record<string, PersonOverride>;

export type OverridablePerson = {
  id: string;
  fullName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  managerEmploymentId?: string | null;
  directReports?: number;
  inCycle?: boolean;
};

function emitOverridesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PERSON_OVERRIDES_CHANGED_EVENT));
}

export function readPersonOverrides(): PersonOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PERSON_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersonOverridesMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writePersonOverride(
  personId: string,
  patch: PersonOverride,
): PersonOverridesMap {
  const id = personId.trim();
  if (!id) return readPersonOverrides();

  const next = { ...readPersonOverrides() };
  const existing = next[id] ?? {};
  const merged: PersonOverride = { ...existing };

  if ("jobTitle" in patch) merged.jobTitle = patch.jobTitle;
  if ("department" in patch) merged.department = patch.department;
  if ("country" in patch) merged.country = patch.country;
  if ("managerEmploymentId" in patch) {
    merged.managerEmploymentId = patch.managerEmploymentId;
  }

  const cleaned = pruneEmptyOverride(merged);
  if (cleaned) next[id] = cleaned;
  else delete next[id];

  try {
    window.localStorage.setItem(
      PERSON_OVERRIDES_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // ignore quota / private mode
  }
  emitOverridesChanged();
  return next;
}

export function clearPersonOverride(personId: string): PersonOverridesMap {
  const id = personId.trim();
  const next = { ...readPersonOverrides() };
  delete next[id];
  try {
    window.localStorage.setItem(
      PERSON_OVERRIDES_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // ignore
  }
  emitOverridesChanged();
  return next;
}

function pruneEmptyOverride(override: PersonOverride): PersonOverride | null {
  const keys = Object.keys(override) as Array<keyof PersonOverride>;
  if (keys.length === 0) return null;
  return override;
}

export function hasPersonOverride(
  personId: string,
  overrides: PersonOverridesMap = readPersonOverrides(),
): boolean {
  return Boolean(overrides[personId.trim()]);
}

/** Merge local overlays onto Remote employment nodes (overrides win when set). */
export function applyPersonOverrides<T extends OverridablePerson>(
  nodes: T[],
  overrides: PersonOverridesMap = readPersonOverrides(),
): T[] {
  if (!nodes.length || Object.keys(overrides).length === 0) return nodes;
  return nodes.map((node) => {
    const patch = overrides[node.id];
    if (!patch) return node;
    return {
      ...node,
      ...("jobTitle" in patch ? { jobTitle: patch.jobTitle ?? null } : {}),
      ...("department" in patch
        ? { department: patch.department ?? null }
        : {}),
      ...("country" in patch ? { country: patch.country ?? null } : {}),
      ...("managerEmploymentId" in patch
        ? { managerEmploymentId: patch.managerEmploymentId ?? null }
        : {}),
    };
  });
}

function toEmploymentRecord(node: OverridablePerson): EmploymentRecord {
  return {
    id: node.id,
    fullName: node.fullName ?? null,
    jobTitle: node.jobTitle ?? null,
    department: node.department ?? null,
    departmentId: null,
    status: null,
    country: node.country ?? null,
    workEmail: null,
    avatarUrl: node.avatarUrl ?? null,
    managerName: null,
    managerEmploymentId: node.managerEmploymentId ?? null,
  };
}

/**
 * Apply overlays and rebuild the reporting forest so manager edits affect the chart.
 */
export function orgSnapshotWithOverrides<T extends OverridablePerson>(
  nodes: T[],
  overrides: PersonOverridesMap = readPersonOverrides(),
): { nodes: T[]; roots: OrgChartPayloadNode[] } {
  const merged = applyPersonOverrides(nodes, overrides);
  if (merged.length === 0) {
    return { nodes: merged, roots: [] };
  }
  const forest = buildOrgForest(merged.map(toEmploymentRecord));
  const flat = flattenOrgForest(forest);
  const byId = new Map(merged.map((n) => [n.id, n]));
  const nodesOut = flat.map((node) => {
    const base = byId.get(node.id);
    return {
      ...(base ?? ({ id: node.id } as T)),
      fullName: node.fullName,
      jobTitle: node.jobTitle,
      department: node.department,
      country: node.country,
      avatarUrl: node.avatarUrl ?? base?.avatarUrl ?? null,
      managerEmploymentId: node.managerEmploymentId,
      directReports: node.directReports,
      inCycle: node.inCycle,
    } as T;
  });
  return {
    nodes: nodesOut,
    roots: forest.roots as OrgChartPayloadNode[],
  };
}

/** Missing profile fields for Data Health / UI hints. */
export function missingProfileFields(person: {
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
}): Array<"title" | "department" | "country"> {
  const missing: Array<"title" | "department" | "country"> = [];
  if (!person.jobTitle?.trim()) missing.push("title");
  if (!person.department?.trim()) missing.push("department");
  if (!person.country?.trim()) missing.push("country");
  return missing;
}
