import { pathIdsToRoot } from "@/lib/org/layout-flow";

export type ManagerIndex = Map<
  string,
  { id: string; managerEmploymentId: string | null }
>;

export type ReportingRelation =
  | {
      status: "ok";
      personAId: string;
      personBId: string;
      lowestCommonManagerId: string | null;
      /** Inclusive hops along A→LCA→B (unique nodes on the combined path minus 1). */
      distance: number;
      pathAToLca: string[];
      pathBToLca: string[];
      /** All node ids on either path including LCA (for chart highlight). */
      highlightIds: Set<string>;
    }
  | {
      status: "same";
      personAId: string;
      personBId: string;
    }
  | {
      status: "disconnected";
      personAId: string;
      personBId: string;
    }
  | {
      status: "missing";
      personAId: string;
      personBId: string;
    };

function ancestorsToRoot(id: string, managers: ManagerIndex): string[] {
  const path: string[] = [];
  let current: string | null = id;
  const guard = new Set<string>();
  while (current && !guard.has(current)) {
    guard.add(current);
    path.push(current);
    current = managers.get(current)?.managerEmploymentId ?? null;
  }
  return path;
}

/**
 * Lowest common ancestor in the manager hierarchy, plus graph distance.
 * `lowestCommonManagerId` is the LCA node itself (may be A or B if one reports
 * to the other). Roots of different trees → disconnected.
 */
export function reportingRelation(
  personAId: string,
  personBId: string,
  managers: ManagerIndex,
): ReportingRelation {
  if (!managers.has(personAId) || !managers.has(personBId)) {
    return { status: "missing", personAId, personBId };
  }
  if (personAId === personBId) {
    return { status: "same", personAId, personBId };
  }

  const pathA = ancestorsToRoot(personAId, managers);
  const pathB = ancestorsToRoot(personBId, managers);
  const setB = new Set(pathB);

  let lca: string | null = null;
  let indexA = -1;
  for (let i = 0; i < pathA.length; i++) {
    const id = pathA[i]!;
    if (setB.has(id)) {
      lca = id;
      indexA = i;
      break;
    }
  }

  if (!lca) {
    return { status: "disconnected", personAId, personBId };
  }

  const indexB = pathB.indexOf(lca);
  const pathAToLca = pathA.slice(0, indexA + 1);
  const pathBToLca = pathB.slice(0, indexB + 1);
  const highlightIds = new Set<string>([...pathAToLca, ...pathBToLca]);
  // Distance = edges on A→LCA plus edges on B→LCA.
  const distance = Math.max(0, pathAToLca.length - 1) + Math.max(0, pathBToLca.length - 1);

  return {
    status: "ok",
    personAId,
    personBId,
    lowestCommonManagerId: lca,
    distance,
    pathAToLca,
    pathBToLca,
    highlightIds,
  };
}

/** Highlight set for a single selected person (path to root). */
export function pathHighlightSet(
  selectedId: string,
  managers: ManagerIndex,
): Set<string> {
  return pathIdsToRoot(selectedId, managers);
}
