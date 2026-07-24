import { describe, expect, it } from "vitest";
import {
  expandCollapsedAncestors,
  personDeepLinkHref,
  readPersonIdFromSearch,
  resolvePersonDeepLink,
  withPersonSearchParam,
} from "@/lib/org/deep-links";

describe("deep-links", () => {
  it("reads person id from search strings", () => {
    expect(readPersonIdFromSearch("?person=emp-1")).toBe("emp-1");
    expect(readPersonIdFromSearch("person=emp-1&x=1")).toBe("emp-1");
    expect(readPersonIdFromSearch("?q=hi")).toBeNull();
    expect(readPersonIdFromSearch("?person=%20")).toBeNull();
  });

  it("sets and clears person while preserving other params", () => {
    expect(withPersonSearchParam("?q=hi", "emp-1")).toBe("?q=hi&person=emp-1");
    expect(withPersonSearchParam("?person=old&q=hi", null)).toBe("?q=hi");
    expect(withPersonSearchParam("", "emp-1")).toBe("?person=emp-1");
    expect(withPersonSearchParam("?person=old", null)).toBe("");
  });

  it("builds a shareable absolute href", () => {
    expect(
      personDeepLinkHref("https://example.com", "/", "emp-9"),
    ).toBe("https://example.com/?person=emp-9");
  });

  it("resolves missing vs ok deep links", () => {
    const known = new Set(["a", "b"]);
    expect(resolvePersonDeepLink(null, known)).toEqual({ status: "none" });
    expect(resolvePersonDeepLink("a", known)).toEqual({
      status: "ok",
      personId: "a",
    });
    expect(resolvePersonDeepLink("z", known)).toEqual({
      status: "missing",
      personId: "z",
    });
  });

  it("expands collapsed ancestors on the path to root", () => {
    const managers = new Map([
      ["c", { id: "c", managerEmploymentId: "b" }],
      ["b", { id: "b", managerEmploymentId: "a" }],
      ["a", { id: "a", managerEmploymentId: null }],
    ]);
    const collapsed = new Set(["a", "b", "other"]);
    expect([...expandCollapsedAncestors("c", managers, collapsed)].sort()).toEqual(
      ["other"],
    );
  });
});
