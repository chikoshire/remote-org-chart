import { describe, expect, it } from "vitest";
import { alphaToNumericId, normalizeNumericId } from "@/lib/geo/iso-numeric";

describe("iso-numeric", () => {
  it("maps alpha codes to padded UN M49 ids", () => {
    expect(alphaToNumericId("USA")).toBe("840");
    expect(alphaToNumericId("bra")).toBe("076");
    expect(alphaToNumericId("GB")).toBe("826");
    expect(alphaToNumericId(null)).toBeNull();
  });

  it("normalizes numeric ids", () => {
    expect(normalizeNumericId(76)).toBe("076");
    expect(normalizeNumericId("840")).toBe("840");
    expect(normalizeNumericId("x")).toBeNull();
  });
});
