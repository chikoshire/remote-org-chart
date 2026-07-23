import type { EmploymentRecord } from "@/lib/remote/employment-schema";
import type { OrgForest, OrgNode } from "@/lib/org/types";

/**
 * Build a manager→reports forest from flat employment records.
 *
 * Policy:
 * - No manager / manager outside dataset → treat as root (orphan manager ids collected).
 * - Self-manager or A→B→A cycles → nodes marked `inCycle`; still linked if manager exists.
 * - Multi-root orgs are supported (multiple CEOs / disconnected trees).
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
      // Self-manager is a one-node cycle; keep as root for layout.
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
        const idx = path.indexOf(current);
        for (const id of path.slice(idx)) {
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

      const managerId = byId.get(current)?.managerEmploymentId ?? null;
      if (!managerId || managerId === current) {
        if (managerId === current) {
          cycle.add(current);
          const node = byId.get(current);
          if (node) node.inCycle = true;
        }
        break;
      }
      current = byId.has(managerId) ? managerId : null;
    }
  }

  return [...cycle];
}

/** Flatten forest depth-first for search / layout helpers. */
export function flattenOrgForest(forest: OrgForest): OrgNode[] {
  const out: OrgNode[] = [];
  const walk = (nodes: OrgNode[]) => {
    for (const node of nodes) {
      out.push(node);
      walk(node.children);
    }
  };
  walk(forest.roots);
  return out;
}
