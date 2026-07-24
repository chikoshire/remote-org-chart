import type { PersonNodeData } from "@/components/org/PersonNodeCard";

export type SearchablePerson = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
};

export function searchPeople(
  people: SearchablePerson[],
  query: string,
  limit = 8,
): SearchablePerson[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return people
    .filter((p) => {
      const name = (p.fullName ?? "").toLowerCase();
      const title = (p.jobTitle ?? "").toLowerCase();
      return name.includes(q) || title.includes(q);
    })
    .slice(0, limit);
}

export function peopleFromNodes(
  nodes: Array<{ id: string; data: PersonNodeData }>,
): SearchablePerson[] {
  return nodes.map((n) => ({
    id: n.id,
    fullName: n.data.fullName,
    jobTitle: n.data.jobTitle,
  }));
}
