import { describe, expect, it } from "vitest";
import {
  expandCollapsedAncestors,
  mapCountryHref,
  peopleDepartmentHref,
  personDeepLinkHref,
  readCompareFlagFromSearch,
  readCountryFromSearch,
  readDepartmentFromSearch,
  readPersonIdFromSearch,
  readViewModeFromSearch,
  resolvePersonDeepLink,
  withCompareSearchParam,
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

  it("reads compare flag from search strings", () => {
    expect(readCompareFlagFromSearch("?compare=1")).toBe(true);
    expect(readCompareFlagFromSearch("?compare=true")).toBe(true);
    expect(readCompareFlagFromSearch("?compare=0")).toBe(false);
    expect(readCompareFlagFromSearch("?q=hi")).toBe(false);
  });

  it("sets and clears compare while preserving other params", () => {
    expect(withCompareSearchParam("?q=hi", true)).toBe("?q=hi&compare=1");
    expect(withCompareSearchParam("?compare=1&q=hi", false)).toBe("?q=hi");
    expect(withCompareSearchParam("", true)).toBe("?compare=1");
  });

  it("builds map country and people department hrefs", () => {
    expect(mapCountryHref("Singapore")).toBe(
      "/app?view=map&country=Singapore",
    );
    expect(peopleDepartmentHref("Marketing")).toBe(
      "/app/people?department=Marketing",
    );
    expect(readViewModeFromSearch("?view=map")).toBe("map");
    expect(readCountryFromSearch("?country=Singapore")).toBe("Singapore");
    expect(readDepartmentFromSearch("?department=Marketing")).toBe(
      "Marketing",
    );
  });
});
