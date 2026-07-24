import { describe, expect, it } from "vitest";
import { chunkArray } from "@/lib/remote/chunk";

describe("chunkArray", () => {
  it("returns empty for empty input", () => {
    expect(chunkArray([], 40)).toEqual([]);
  });

  it("keeps a single short list intact", () => {
    expect(chunkArray([1, 2, 3], 40)).toEqual([[1, 2, 3]]);
  });

  it("splits on exact boundaries", () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("allows a short final chunk", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("rejects non-positive sizes", () => {
    expect(() => chunkArray([1], 0)).toThrow(/chunk size/);
  });
});
