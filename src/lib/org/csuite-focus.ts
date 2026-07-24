import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

/**
 * Node ids for the initial org-chart viewport: roots plus enough direct
 * reports to land on a readable C-suite framing (not the whole company).
 */
export function cSuiteFocusNodeIds(
  roots: OrgChartPayloadNode[],
  maxPeople = 8,
): string[] {
  const ids: string[] = [];
  for (const root of roots) {
    if (ids.length >= maxPeople) return ids;
    ids.push(root.id);
  }
  for (const root of roots) {
    for (const child of root.children ?? []) {
      if (ids.length >= maxPeople) return ids;
      ids.push(child.id);
    }
  }
  return ids;
}
