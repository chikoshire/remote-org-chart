import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

export type OrgInsights = {
  headcount: number;
  rootCount: number;
  maxDepth: number;
  /** Mean direct reports among people who manage ≥1 person. */
  avgSpanOfControl: number | null;
  /** Median direct reports among people who manage ≥1 person. */
  medianSpanOfControl: number | null;
  managerCount: number;
  individualContributorCount: number;
  cycleMemberCount: number;
  departmentCount: number;
  countryCount: number;
};

function median(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/** Derive org metrics from a forest (or filtered/collapsed forest). */
export function computeOrgInsights(
  roots: OrgChartPayloadNode[],
): OrgInsights {
  let headcount = 0;
  let maxDepth = 0;
  let cycleMemberCount = 0;
  const spans: number[] = [];
  const departments = new Set<string>();
  const countries = new Set<string>();

  const stack: Array<{ node: OrgChartPayloadNode; depth: number }> = roots.map(
    (node) => ({ node, depth: 1 }),
  );

  while (stack.length > 0) {
    const { node, depth } = stack.pop()!;
    headcount += 1;
    maxDepth = Math.max(maxDepth, depth);
    if (node.inCycle) cycleMemberCount += 1;
    if (node.department?.trim()) departments.add(node.department.trim());
    if (node.country?.trim()) countries.add(node.country.trim());
    if (node.directReports > 0) spans.push(node.directReports);
    for (const child of node.children ?? []) {
      stack.push({ node: child, depth: depth + 1 });
    }
  }

  spans.sort((a, b) => a - b);
  const managerCount = spans.length;
  const avgSpanOfControl =
    managerCount === 0
      ? null
      : Math.round((spans.reduce((a, b) => a + b, 0) / managerCount) * 10) / 10;

  return {
    headcount,
    rootCount: roots.length,
    maxDepth: headcount === 0 ? 0 : maxDepth,
    avgSpanOfControl,
    medianSpanOfControl: median(spans),
    managerCount,
    individualContributorCount: headcount - managerCount,
    cycleMemberCount,
    departmentCount: departments.size,
    countryCount: countries.size,
  };
}
