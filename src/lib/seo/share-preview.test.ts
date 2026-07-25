import { describe, expect, it } from "vitest";
import { sharePreviewMetadata } from "@/lib/seo/share-preview";
import { absoluteUrl, SITE_URL } from "@/lib/site";

describe("share preview metadata", () => {
  it("builds absolute OG and Twitter card fields", () => {
    const meta = sharePreviewMetadata({
      title: "Acme · People intelligence",
      description: "Explore reporting lines.",
      path: "/",
    });

    expect(meta.openGraph?.url).toBe(`${SITE_URL}/`);
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({
        url: absoluteUrl("/marketing/hero-org-chart.png"),
        width: 1600,
        height: 1000,
      }),
    ]);
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: [absoluteUrl("/marketing/hero-org-chart.png")],
    });
  });
});
