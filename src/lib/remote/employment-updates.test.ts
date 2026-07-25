import { describe, expect, it } from "vitest";
import { toRemoteCountryCode } from "@/lib/remote/employment-updates";

describe("toRemoteCountryCode", () => {
  it("accepts ISO-3 and ISO-2", () => {
    expect(toRemoteCountryCode("PRT")).toBe("PRT");
    expect(toRemoteCountryCode("pt")).toBe("PRT");
    expect(toRemoteCountryCode("GB")).toBe("GBR");
    expect(toRemoteCountryCode("UK")).toBe("GBR");
  });

  it("maps common labels", () => {
    expect(toRemoteCountryCode("United Kingdom")).toBe("GBR");
    expect(toRemoteCountryCode("Hong Kong")).toBe("HKG");
  });

  it("returns null for unknown labels", () => {
    expect(toRemoteCountryCode("Atlantis")).toBeNull();
  });
});
