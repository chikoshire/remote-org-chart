import type { EmploymentRecord } from "@/lib/remote/employment-schema";
import type { OrgForest, OrgNode } from "@/lib/org/types";

/**
 * Build a manager→reports forest from employment records.
 *
 * Policy:
 * - No manager → root
 * - Manager id not in dataset → treat as root; record orphan manager id
 * - Self-manager or A→B→A → mark `inCycle`; still attach edges where possible
 * - Multiple roots allowed (multi-tree forest)
 */
export function buildOrgForest(records: EmploymentRecord[]): OrgForest {
  const byId = new Map<string, OrgNode>();

  for (const record of records) {
    byId.set(record.id, {
      id: record.id,
      fullName: record.fullName,
      jobTitle: record.jobTitle,
      department: record.department,
      departmentId: record.departmentId,
      status: record.status,
      country: record.country,
      workEmail: record.workEmail,
      managerEmploymentId: record.managerEmploymentId,
      children: [],
      inCycle: false,
      directReports: 0,
    });
  }

  const roots: OrgNode[] = [];
  const orphanManagerIds: string[] = [];

  for (const node of byId.values()) {
    const managerId = node.managerEmploymentId;
    if (!managerId) {
      roots.push(node);
      continue;
    }
    if (managerId === node.id) {
      node.inCycle = true;
      roots.push(node);
      continue;
    }
    const manager = byId.get(managerId);
    if (!manager) {
      orphanManagerIds.push(managerId);
      roots.push(node);
      continue;
    }
    manager.children.push(node);
  }

  const cycleIds = markCycles(byId);

  // Pure cycles (A↔B) never enter `roots` via missing-manager; promote
  // unreachable nodes so the forest still has an entry point.
  const reachable = new Set<string>();
  const markReachable = (nodes: OrgNode[]) => {
    for (const node of nodes) {
      if (reachable.has(node.id)) continue;
      reachable.add(node.id);
      markReachable(node.children);
    }
  };
  markReachable(roots);
  for (const node of byId.values()) {
    if (!reachable.has(node.id)) {
      roots.push(node);
      markReachable([node]);
    }
  }

  // Drop child edges that close a cycle so tree walks terminate.
  for (const node of byId.values()) {
    node.children = node.children.filter((child) => {
      if (!child.inCycle || !node.inCycle) return true;
      // Keep manager→report edges that are not the back-edge:
      // child claims this node as manager → keep; if this node claims child
      // as manager, drop to break A↔B.
      return child.managerEmploymentId === node.id;
    });
  }

  for (const node of byId.values()) {
    node.directReports = node.children.length;
    node.children.sort(compareNodes);
  }
  roots.sort(compareNodes);

  return {
    roots,
    orphanManagerIds: [...new Set(orphanManagerIds)],
    cycleIds,
    nodeCount: byId.size,
  };
}

function compareNodes(a: OrgNode, b: OrgNode): number {
  const an = (a.fullName ?? a.id).toLocaleLowerCase();
  const bn = (b.fullName ?? b.id).toLocaleLowerCase();
  return an.localeCompare(bn);
}

function markCycles(byId: Map<string, OrgNode>): string[] {
  const cycle = new Set<string>();
  const visited = new Set<string>();

  for (const startId of byId.keys()) {
    if (visited.has(startId)) continue;

    const path: string[] = [];
    const onPath = new Set<string>();
    let current: string | null = startId;

    while (current && byId.has(current)) {
      if (onPath.has(current)) {
        const start = path.indexOf(current);
        for (const id of path.slice(start)) {
          cycle.add(id);
          const node = byId.get(id);
          if (node) node.inCycle = true;
        }
        break;
      }
      if (visited.has(current)) break;

      path.push(current);
      onPath.add(current);
      visited.add(current);

      const next: string | null =
        byId.get(current)?.managerEmploymentId ?? null;
      if (!next || next === current) {
        if (next === current) {
          cycle.add(current);
          const node = byId.get(current);
          if (node) node.inCycle = true;
        }
        break;
      }
      current = byId.has(next) ? next : null;
    }
  }

  return [...cycle];
}

/** Flatten forest depth-first for search / layout helpers. */
export function flattenOrgForest(forest: OrgForest): OrgNode[] {
  const out: OrgNode[] = [];
  const seen = new Set<string>();
  const walk = (nodes: OrgNode[]) => {
    for (const node of nodes) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      out.push(node);
      walk(node.children);
    }
  };
  walk(forest.roots);
  return out;
}
