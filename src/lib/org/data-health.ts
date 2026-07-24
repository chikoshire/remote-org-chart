export type HealthPerson = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  managerEmploymentId: string | null;
  inCycle?: boolean;
};

export type DataHealthReport = {
  headcount: number;
  rootCount: number;
  lastSyncedAt: string | null;
  /** People whose manager id is set but not in the active employment set. */
  managerMissing: HealthPerson[];
  /** People with no manager on file (true roots). */
  noManagerOnFile: HealthPerson[];
  /** Missing job title, department, or country. */
  incompleteFields: HealthPerson[];
  /** People sitting on a reporting cycle. */
  inCycle: HealthPerson[];
  orphanManagerIds: string[];
  multiRoot: boolean;
};

export function isIncompletePerson(person: HealthPerson): boolean {
  return (
    !person.jobTitle?.trim() ||
    !person.department?.trim() ||
    !person.country?.trim()
  );
}

export function personHasManagerMissing(
  person: HealthPerson,
  byId: Map<string, HealthPerson>,
): boolean {
  const mgr = person.managerEmploymentId?.trim();
  if (!mgr) return false;
  return !byId.has(mgr);
}

/** Build actionable Data Health lists from a flat employment snapshot. */
export function computeDataHealth(
  people: HealthPerson[],
  options?: {
    orphanManagerIds?: string[];
    lastSyncedAt?: string | null;
  },
): DataHealthReport {
  const byId = new Map(people.map((p) => [p.id, p]));
  const managerMissing: HealthPerson[] = [];
  const noManagerOnFile: HealthPerson[] = [];
  const incompleteFields: HealthPerson[] = [];
  const inCycle: HealthPerson[] = [];

  for (const person of people) {
    if (personHasManagerMissing(person, byId)) {
      managerMissing.push(person);
    } else if (!person.managerEmploymentId?.trim()) {
      noManagerOnFile.push(person);
    }
    if (isIncompletePerson(person)) {
      incompleteFields.push(person);
    }
    if (person.inCycle) {
      inCycle.push(person);
    }
  }

  const sortByName = (a: HealthPerson, b: HealthPerson) =>
    (a.fullName ?? a.id).localeCompare(b.fullName ?? b.id);

  managerMissing.sort(sortByName);
  noManagerOnFile.sort(sortByName);
  incompleteFields.sort(sortByName);
  inCycle.sort(sortByName);

  const orphanFromPeople = [
    ...new Set(
      managerMissing
        .map((p) => p.managerEmploymentId?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  return {
    headcount: people.length,
    rootCount: noManagerOnFile.length + managerMissing.length,
    lastSyncedAt: options?.lastSyncedAt ?? null,
    managerMissing,
    noManagerOnFile,
    incompleteFields,
    inCycle,
    orphanManagerIds: [
      ...new Set([...(options?.orphanManagerIds ?? []), ...orphanFromPeople]),
    ],
    multiRoot: noManagerOnFile.length + managerMissing.length > 1,
  };
}
