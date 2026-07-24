import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

/**
 * Node ids for the initial org-chart viewport.
 * Prefer the largest root only - including distant direct reports in fitView
 * stretches the bounds across the full reports row and leaves leadership
 * off-screen.
 */
export function cSuiteFocusNodeIds(
  roots: OrgChartPayloadNode[],
  _maxPeople = 1,
): string[] {
  if (roots.length === 0) return [];
  const primary = [...roots].sort(
    (a, b) => (b.children?.length ?? 0) - (a.children?.length ?? 0),
  )[0]!;
  return [primary.id];
}
