import { describe, expect, it } from "vitest";
import {
  mapOrgChartHttpError,
  warningCopy,
  warningsFromMeta,
} from "@/lib/org/chart-state";

describe("mapOrgChartHttpError", () => {
  it("marks auth problems as retryable so a transient sandbox blip can recover", () => {
    const err = mapOrgChartHttpError(401, { code: "unauthorized" });
    expect(err.retryable).toBe(true);
    expect(err.message).toMatch(/token/i);
  });

  it("marks rate limits as retryable", () => {
    expect(mapOrgChartHttpError(429, { code: "rate_limited" }).retryable).toBe(
      true,
    );
  });
});

describe("warningsFromMeta", () => {
  it("surfaces cycle and orphan warnings", () => {
    const warnings = warningsFromMeta({ cycleCount: 2, orphanManagerCount: 1 });
    expect(warnings).toHaveLength(2);
    expect(warningCopy(warnings[0]!)).toMatch(/cycle/i);
    expect(warningCopy(warnings[1]!)).toMatch(/manager/i);
  });
});
