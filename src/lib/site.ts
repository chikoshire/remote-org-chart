/**
 * Canonical public origin for Open Graph / Twitter cards.
 * Override with NEXT_PUBLIC_SITE_URL when using a custom domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://remote-org-chart.shirechiko.workers.dev"
);

export const SITE_NAME = "Acme Org Chart";

export const DEFAULT_OG_IMAGE_PATH = "/marketing/hero-org-chart.png";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
