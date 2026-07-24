import { describe, expect, it } from "vitest";
import { getHelpPage, listHelpPages, retrieveHelpChunks } from "@/lib/help/load-help";

describe("help KB", () => {
  it("lists all help pages without credential literals", () => {
    const pages = listHelpPages();
    expect(pages.length).toBeGreaterThanOrEqual(7);
    const blob = pages.map((p) => p.markdown).join("\n");
    expect(blob).not.toMatch(/acme-org-demo/);
    expect(getHelpPage("overview")?.title).toBe("Overview");
  });

  it("retrieves sync page for refresh queries", () => {
    const hits = retrieveHelpChunks("refresh from remote cache", 3);
    expect(hits.some((h) => h.slug === "sync" || h.slug === "dashboard")).toBe(
      true,
    );
  });
});
