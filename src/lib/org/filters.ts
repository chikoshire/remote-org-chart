import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

export type OrgFilters = {
  department: string | null;
  country: string | null;
};

export const EMPTY_ORG_FILTERS: OrgFilters = {
  department: null,
  country: null,
};

export function filtersAreActive(filters: OrgFilters): boolean {
  return Boolean(filters.department || filters.country);
}

export function collectFilterOptions(roots: OrgChartPayloadNode[]): {
  departments: string[];
  countries: string[];
} {
  const departments = new Set<string>();
  const countries = new Set<string>();
  const stack = [...roots];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.department?.trim()) departments.add(node.department.trim());
    if (node.country?.trim()) countries.add(node.country.trim());
    for (const child of node.children ?? []) stack.push(child);
  }
  return {
    departments: [...departments].sort((a, b) => a.localeCompare(b)),
    countries: [...countries].sort((a, b) => a.localeCompare(b)),
  };
}

function nodeMatches(node: OrgChartPayloadNode, filters: OrgFilters): boolean {
  if (
    filters.department &&
    (node.department?.trim() ?? "") !== filters.department
  ) {
    return false;
  }
  if (filters.country && (node.country?.trim() ?? "") !== filters.country) {
    return false;
  }
  return true;
}

/**
 * Keep matching people and ancestors needed to preserve their path to root.
 * Non-matching ancestors stay as connectors when they have matching descendants.
 */
export function filterOrgForest(
  roots: OrgChartPayloadNode[],
  filters: OrgFilters,
): OrgChartPayloadNode[] {
  if (!filtersAreActive(filters)) return roots;

  const filterNode = (
    node: OrgChartPayloadNode,
  ): OrgChartPayloadNode | null => {
    const childResults = (node.children ?? [])
      .map(filterNode)
      .filter((child): child is OrgChartPayloadNode => child !== null);
    const selfMatch = nodeMatches(node, filters);
    if (!selfMatch && childResults.length === 0) return null;
    return {
      ...node,
      children: childResults,
      // Keep original directReports for badges; visible kids may be a subset.
    };
  };

  return roots
    .map(filterNode)
    .filter((node): node is OrgChartPayloadNode => node !== null);
}
