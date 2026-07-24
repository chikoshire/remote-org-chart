import { describe, expect, it } from "vitest";
import { reportingRelation } from "@/lib/org/reporting-distance";

function managers() {
  //     ceo
  //    /   \
  //   a     b
  //  / \
  // a1 a2
  return new Map([
    ["ceo", { id: "ceo", managerEmploymentId: null }],
    ["a", { id: "a", managerEmploymentId: "ceo" }],
    ["b", { id: "b", managerEmploymentId: "ceo" }],
    ["a1", { id: "a1", managerEmploymentId: "a" }],
    ["a2", { id: "a2", managerEmploymentId: "a" }],
    ["other", { id: "other", managerEmploymentId: null }],
  ]);
}

describe("reportingRelation", () => {
  it("finds LCA and distance across a subtree", () => {
    const result = reportingRelation("a1", "a2", managers());
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.lowestCommonManagerId).toBe("a");
    expect(result.distance).toBe(2);
    expect([...result.highlightIds].sort()).toEqual(["a", "a1", "a2"]);
  });

  it("finds LCA at the root across branches", () => {
    const result = reportingRelation("a1", "b", managers());
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.lowestCommonManagerId).toBe("ceo");
    expect(result.distance).toBe(3);
  });

  it("handles ancestor/descendant (LCA is the ancestor)", () => {
    const result = reportingRelation("ceo", "a1", managers());
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.lowestCommonManagerId).toBe("ceo");
    expect(result.distance).toBe(2);
  });

  it("marks disconnected forests", () => {
    expect(reportingRelation("a1", "other", managers()).status).toBe(
      "disconnected",
    );
  });

  it("marks same person and missing ids", () => {
    expect(reportingRelation("a", "a", managers()).status).toBe("same");
    expect(reportingRelation("a", "nope", managers()).status).toBe("missing");
  });
});
