import { describe, expect, it } from "vitest";
import { navigateReportingRelative } from "@/lib/org/keyboard-nav";

function people() {
  return new Map([
    ["ceo", { id: "ceo", managerEmploymentId: null }],
    ["a", { id: "a", managerEmploymentId: "ceo" }],
    ["b", { id: "b", managerEmploymentId: "ceo" }],
    ["c", { id: "c", managerEmploymentId: "ceo" }],
    ["a1", { id: "a1", managerEmploymentId: "a" }],
  ]);
}

describe("navigateReportingRelative", () => {
  const order = ["a", "b", "c", "a1", "ceo"];

  it("moves up to manager", () => {
    expect(navigateReportingRelative("a", "ArrowUp", people(), order)).toBe(
      "ceo",
    );
    expect(navigateReportingRelative("ceo", "ArrowUp", people(), order)).toBe(
      null,
    );
  });

  it("moves down to first report", () => {
    expect(navigateReportingRelative("ceo", "ArrowDown", people(), order)).toBe(
      "a",
    );
    expect(navigateReportingRelative("a1", "ArrowDown", people(), order)).toBe(
      null,
    );
  });

  it("moves across siblings", () => {
    expect(navigateReportingRelative("b", "ArrowLeft", people(), order)).toBe(
      "a",
    );
    expect(navigateReportingRelative("b", "ArrowRight", people(), order)).toBe(
      "c",
    );
    expect(navigateReportingRelative("a", "ArrowLeft", people(), order)).toBe(
      null,
    );
  });
});
