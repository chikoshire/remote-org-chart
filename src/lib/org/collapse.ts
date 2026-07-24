import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

export type ChartDensity = "comfortable" | "compact";

export const DENSITY_STORAGE_KEY = "remote-org-chart:density";

export function readStoredDensity(): ChartDensity {
  if (typeof window === "undefined") return "comfortable";
  try {
    const value = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    return value === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
}

export function writeStoredDensity(density: ChartDensity): void {
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  } catch {
    // ignore quota / private mode
  }
}

export function countDescendants(nodes: OrgChartPayloadNode[]): number {
  let total = 0;
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.pop()!;
    total += 1;
    for (const child of node.children ?? []) stack.push(child);
  }
  return total;
}

/**
 * Clone the forest, dropping children under collapsed managers.
 * Collapsed managers keep a `collapsedCount` of hidden descendants.
 */
export function applyCollapseToForest(
  roots: OrgChartPayloadNode[],
  collapsedIds: Set<string>,
): OrgChartPayloadNode[] {
  const mapNode = (node: OrgChartPayloadNode): OrgChartPayloadNode => {
    const children = node.children ?? [];
    if (collapsedIds.has(node.id)) {
      return {
        ...node,
        children: [],
        // stash for UI badge — not part of API type, carried via passthrough on layout
        collapsedCount: countDescendants(children),
      } as OrgChartPayloadNode & { collapsedCount: number };
    }
    return {
      ...node,
      children: children.map(mapNode),
    };
  };
  return roots.map(mapNode);
}

export function densityMetrics(density: ChartDensity): {
  width: number;
  height: number;
  nodesep: number;
  ranksep: number;
} {
  if (density === "compact") {
    return { width: 168, height: 72, nodesep: 20, ranksep: 48 };
  }
  return { width: 220, height: 96, nodesep: 36, ranksep: 72 };
}
