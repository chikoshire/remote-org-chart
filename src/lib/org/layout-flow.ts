import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { OrgNode } from "@/lib/org/types";
import type { PersonNodeData } from "@/components/org/PersonNodeCard";
import type { ReportingEdgeData } from "@/components/org/ReportingEdge";
import { personAccessibleName } from "@/lib/org/person-a11y";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 96;

export type OrgChartPayloadNode = Omit<OrgNode, "children"> & {
  children?: OrgChartPayloadNode[];
};

export function walkOrgTree(
  roots: OrgChartPayloadNode[],
  visit: (node: OrgChartPayloadNode, parentId: string | null) => void,
): void {
  const stack: Array<{ node: OrgChartPayloadNode; parentId: string | null }> =
    roots.map((node) => ({ node, parentId: null }));
  while (stack.length > 0) {
    const { node, parentId } = stack.pop()!;
    visit(node, parentId);
    const children = node.children ?? [];
    for (let i = children.length - 1; i >= 0; i -= 1) {
      stack.push({ node: children[i]!, parentId: node.id });
    }
  }
}

export function layoutOrgChart(
  roots: OrgChartPayloadNode[],
): { nodes: Node<PersonNodeData>[]; edges: Edge<ReportingEdgeData>[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 36, ranksep: 72, marginx: 24, marginy: 24 });

  const nodes: Node<PersonNodeData>[] = [];
  const edges: Edge<ReportingEdgeData>[] = [];
  const seen = new Set<string>();

  walkOrgTree(roots, (node, parentId) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    nodes.push({
      id: node.id,
      type: "person",
      position: { x: 0, y: 0 },
      ariaLabel: personAccessibleName({
        fullName: node.fullName,
        jobTitle: node.jobTitle,
        department: node.department,
        country: node.country,
        directReports: node.directReports,
        inCycle: node.inCycle,
        variant: parentId === null ? "root" : "default",
      }),
      data: {
        fullName: node.fullName,
        jobTitle: node.jobTitle,
        department: node.department,
        country: node.country,
        directReports: node.directReports,
        inCycle: node.inCycle,
        variant: parentId === null ? "root" : "default",
      },
    });
    if (parentId) {
      g.setEdge(parentId, node.id);
      edges.push({
        id: `${parentId}->${node.id}`,
        source: parentId,
        target: node.id,
        type: "reporting",
        data: { highlighted: false },
      });
    }
  });

  dagre.layout(g);

  const laidOut = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: laidOut, edges };
}

/** Ancestors from selected id up to a root (inclusive), using manager links on flat nodes. */
export function pathIdsToRoot(
  selectedId: string,
  byId: Map<string, { id: string; managerEmploymentId: string | null }>,
): Set<string> {
  const path = new Set<string>();
  let current: string | null = selectedId;
  const guard = new Set<string>();
  while (current && !guard.has(current)) {
    guard.add(current);
    path.add(current);
    const node = byId.get(current);
    current = node?.managerEmploymentId ?? null;
  }
  return path;
}
