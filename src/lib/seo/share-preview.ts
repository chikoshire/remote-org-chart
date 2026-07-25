import type { Metadata } from "next";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export type SharePreviewInput = {
  title: string;
  description: string;
  path?: string;
  imagePath?: string;
};

/**
 * Open Graph + Twitter card metadata for share previews (GH#101).
 */
export function sharePreviewMetadata({
  title,
  description,
  path = "/",
  imagePath = DEFAULT_OG_IMAGE_PATH,
}: SharePreviewInput): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(imagePath);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: 1600,
          height: 1000,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
