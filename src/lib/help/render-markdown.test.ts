import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderHelpMarkdown } from "@/lib/help/render-markdown";

describe("renderHelpMarkdown", () => {
  it("embeds annotated help shots from {{shot:id}}", () => {
    const html = renderToStaticMarkup(
      renderHelpMarkdown("# Demo\n\n{{shot:chrome-health}}\n"),
    );
    expect(html).toContain("chrome-search-health-settings.png");
    expect(html).toContain("Callout 1.");
    expect(html).toContain("Health");
  });

  it("renders plain markdown images as figures", () => {
    const html = renderToStaticMarkup(
      renderHelpMarkdown('![Alt text](/help/dashboard.png "Lead line")\n'),
    );
    expect(html).toContain("/help/dashboard.png");
    expect(html).toContain("Lead line");
    expect(html).toContain('alt="Alt text"');
  });
});
