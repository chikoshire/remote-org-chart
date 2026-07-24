import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

/**
 * Node ids for the initial org-chart viewport.
 * Prefer the largest root tree so multi-root forests don’t force a tiny
 * fit across the full company width — land on a readable C-suite framing.
 */
export function cSuiteFocusNodeIds(
  roots: OrgChartPayloadNode[],
  maxPeople = 4,
): string[] {
  if (roots.length === 0) return [];
  const primary = [...roots].sort(
    (a, b) => (b.children?.length ?? 0) - (a.children?.length ?? 0),
  )[0]!;
  const ids: string[] = [primary.id];
  // Only a few adjacent direct reports so fitView stays tight on leadership.
  for (const child of primary.children ?? []) {
    if (ids.length >= maxPeople) break;
    ids.push(child.id);
  }
  return ids;
}
