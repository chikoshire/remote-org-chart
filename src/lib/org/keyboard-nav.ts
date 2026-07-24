export type NavPerson = {
  id: string;
  managerEmploymentId: string | null;
};

/**
 * Keyboard navigation over the reporting graph.
 * - ArrowUp → manager
 * - ArrowDown → first direct report (name-sorted when `order` provided)
 * - ArrowLeft / ArrowRight → previous / next sibling under the same manager
 */
export function navigateReportingRelative(
  selectedId: string,
  key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
  people: ReadonlyMap<string, NavPerson>,
  /** Optional display order for reports/siblings (e.g. name-sorted ids). */
  orderedIds?: readonly string[],
): string | null {
  const selected = people.get(selectedId);
  if (!selected) return null;

  if (key === "ArrowUp") {
    return selected.managerEmploymentId;
  }

  const orderIndex = (id: string) => {
    if (!orderedIds) return 0;
    const idx = orderedIds.indexOf(id);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  const sortIds = (ids: string[]) =>
    [...ids].sort((a, b) => orderIndex(a) - orderIndex(b) || a.localeCompare(b));

  if (key === "ArrowDown") {
    const reports = sortIds(
      [...people.values()]
        .filter((p) => p.managerEmploymentId === selectedId)
        .map((p) => p.id),
    );
    return reports[0] ?? null;
  }

  const managerId = selected.managerEmploymentId;
  const siblings = sortIds(
    [...people.values()]
      .filter((p) => p.managerEmploymentId === managerId)
      .map((p) => p.id),
  );
  const index = siblings.indexOf(selectedId);
  if (index === -1) return null;
  if (key === "ArrowLeft") {
    return index > 0 ? siblings[index - 1]! : null;
  }
  return index < siblings.length - 1 ? siblings[index + 1]! : null;
}
