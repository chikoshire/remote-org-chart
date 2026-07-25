import { describe, expect, it } from "vitest";
import {
  canonicalCountryCode,
  countrySelectOptions,
  formatCountryLabel,
  resolveCountryCode,
  sortCountryCodesByLabel,
} from "@/lib/ui/format-country";

describe("formatCountryLabel", () => {
  it("maps ISO codes to full names including Hong Kong", () => {
    expect(formatCountryLabel("USA")).toBe("United States");
    expect(formatCountryLabel("GBR")).toBe("United Kingdom");
    expect(formatCountryLabel("HKG")).toBe("Hong Kong");
    expect(formatCountryLabel(null)).toBeNull();
  });

  it("strips trailing ISO aliases from Remote display names", () => {
    expect(formatCountryLabel("United Kingdom (UK)")).toBe("United Kingdom");
    expect(formatCountryLabel("United States (USA)")).toBe("United States");
  });
});

describe("canonicalCountryCode", () => {
  it("prefers alpha-3 codes and accepts full names", () => {
    expect(canonicalCountryCode("GB")).toBe("GBR");
    expect(canonicalCountryCode("United Kingdom")).toBe("GBR");
    expect(canonicalCountryCode("gbr")).toBe("GBR");
  });
});

describe("countrySelectOptions", () => {
  it("lists unique full-name labels", () => {
    const options = countrySelectOptions();
    expect(options.some((o) => o.label === "United Kingdom" && o.code === "GBR")).toBe(
      true,
    );
    expect(options.every((o) => o.label.length > 2)).toBe(true);
  });
});

describe("resolveCountryCode", () => {
  const known = ["USA", "GBR", "HKG", "NLD", "CAN"];

  it("resolves labels from the dashboard to employment codes", () => {
    expect(resolveCountryCode("United States", known)).toBe("USA");
    expect(resolveCountryCode("Hong Kong", known)).toBe("HKG");
    expect(resolveCountryCode("Netherlands", known)).toBe("NLD");
  });

  it("resolves codes case-insensitively", () => {
    expect(resolveCountryCode("usa", known)).toBe("USA");
    expect(resolveCountryCode("HKG", known)).toBe("HKG");
  });

  it("returns null when unknown", () => {
    expect(resolveCountryCode("Atlantis", known)).toBeNull();
    expect(resolveCountryCode("United States", [])).toBeNull();
  });
});

describe("sortCountryCodesByLabel", () => {
  it("sorts by full name not ISO code", () => {
    expect(sortCountryCodesByLabel(["USA", "CAN", "GBR"])).toEqual([
      "CAN",
      "GBR",
      "USA",
    ]);
  });
});
