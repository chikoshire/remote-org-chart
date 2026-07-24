import { describe, expect, it } from "vitest";
import { searchPeople } from "@/lib/org/search-people";

describe("searchPeople", () => {
  const people = [
    { id: "1", fullName: "Ada Lovelace", jobTitle: "Chief Scientist" },
    { id: "2", fullName: "Grace Hopper", jobTitle: "Engineering Manager" },
    { id: "3", fullName: "Alan Turing", jobTitle: "Cryptographer" },
  ];

  it("matches name substrings case-insensitively", () => {
    expect(searchPeople(people, "lovel").map((p) => p.id)).toEqual(["1"]);
  });

  it("matches job titles and respects limit", () => {
    expect(searchPeople(people, "eng", 1)).toHaveLength(1);
    expect(searchPeople(people, "eng")[0]?.id).toBe("2");
  });

  it("returns empty for blank queries", () => {
    expect(searchPeople(people, "  ")).toEqual([]);
  });
});
