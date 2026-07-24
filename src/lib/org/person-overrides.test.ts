import { describe, expect, it } from "vitest";
import {
  applyPersonOverrides,
  missingProfileFields,
  orgSnapshotWithOverrides,
  type PersonOverridesMap,
} from "@/lib/org/person-overrides";

describe("applyPersonOverrides", () => {
  const nodes = [
    {
      id: "a",
      fullName: "A",
      jobTitle: null as string | null,
      department: "Engineering",
      country: "PT",
      managerEmploymentId: null as string | null,
    },
    {
      id: "b",
      fullName: "B",
      jobTitle: "IC",
      department: null as string | null,
      country: null as string | null,
      managerEmploymentId: "a" as string | null,
    },
  ];

  it("returns the same array when there are no overrides", () => {
    expect(applyPersonOverrides(nodes, {})).toBe(nodes);
  });

  it("merges field overlays without mutating other people", () => {
    const overrides: PersonOverridesMap = {
      a: { jobTitle: "Staff Engineer", managerEmploymentId: "b" },
    };
    const next = applyPersonOverrides(nodes, overrides);
    expect(next[0]).toMatchObject({
      id: "a",
      jobTitle: "Staff Engineer",
      department: "Engineering",
      managerEmploymentId: "b",
    });
    expect(next[1]).toEqual(nodes[1]);
  });

  it("allows clearing manager with explicit null", () => {
    const overrides: PersonOverridesMap = {
      b: { managerEmploymentId: null },
    };
    const next = applyPersonOverrides(nodes, overrides);
    expect(next[1]?.managerEmploymentId).toBeNull();
  });
});

describe("orgSnapshotWithOverrides", () => {
  it("rebuilds roots when a manager override is applied", () => {
    const nodes = [
      {
        id: "ceo",
        fullName: "CEO",
        jobTitle: "CEO",
        department: "Exec",
        country: "US",
        managerEmploymentId: null as string | null,
      },
      {
        id: "ic",
        fullName: "IC",
        jobTitle: null as string | null,
        department: null as string | null,
        country: null as string | null,
        managerEmploymentId: null as string | null,
      },
    ];
    const { roots, nodes: next } = orgSnapshotWithOverrides(nodes, {
      ic: {
        jobTitle: "Engineer",
        department: "Engineering",
        country: "PT",
        managerEmploymentId: "ceo",
      },
    });
    expect(roots).toHaveLength(1);
    const root = roots[0];
    expect(root?.id).toBe("ceo");
    expect((root?.children ?? []).map((c) => c.id)).toEqual(["ic"]);
    expect(next.find((n) => n.id === "ic")).toMatchObject({
      jobTitle: "Engineer",
      managerEmploymentId: "ceo",
      department: "Engineering",
    });
  });
});

describe("missingProfileFields", () => {
  it("lists empty title, department, and country", () => {
    expect(
      missingProfileFields({
        jobTitle: " ",
        department: null,
        country: undefined,
      }),
    ).toEqual(["title", "department", "country"]);
    expect(
      missingProfileFields({
        jobTitle: "PM",
        department: "Ops",
        country: "US",
      }),
    ).toEqual([]);
  });
});
