/** Resolve Remote profile picture URLs and stable generated avatar fallbacks. */

const REMOTE_HOST_HINTS = [
  "remote.com",
  "remote-sandbox.com",
  "cloudfront.net",
  "amazonaws.com",
  "googleusercontent.com",
];

export function isAllowedAvatarUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return REMOTE_HOST_HINTS.some(
      (hint) => host === hint || host.endsWith(`.${hint}`),
    );
  } catch {
    return false;
  }
}

/** Pull profile_picture from employment detail (or nested user) when present. */
export function extractProfilePicture(
  detail: Record<string, unknown> | null | undefined,
  listItem?: Record<string, unknown> | null,
): string | null {
  const candidates: unknown[] = [
    detail?.profile_picture,
    listItem?.profile_picture,
  ];
  const user = detail?.user;
  if (user && typeof user === "object" && user !== null) {
    candidates.push((user as Record<string, unknown>).profile_picture);
  }
  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (isAllowedAvatarUrl(trimmed)) return trimmed;
  }
  return null;
}

/**
 * Stable portrait-style avatar when Remote has no photo (sandbox common).
 * Seeded by employment id so the same person always gets the same face.
 */
export function generatedAvatarUrl(personId: string, fullName?: string | null): string {
  const seed = encodeURIComponent(personId || fullName?.trim() || "person");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundType=gradientLinear&backgroundColor=e8e4ff,d4f4f7`;
}

export function resolveAvatarSrc(options: {
  avatarUrl?: string | null;
  personId: string;
  fullName?: string | null;
}): string {
  const remote = options.avatarUrl?.trim();
  if (remote && isAllowedAvatarUrl(remote)) return remote;
  return generatedAvatarUrl(options.personId, options.fullName);
}
