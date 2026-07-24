/** Resolve Remote profile picture URLs. No third-party generated faces. */

const REMOTE_HOST_HINTS = [
  "remote.com",
  "remote-sandbox.com",
  "cloudfront.net",
  "amazonaws.com",
  "googleusercontent.com",
  "employ-assets.remote.com",
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

function readPictureCandidate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isAllowedAvatarUrl(trimmed) ? trimmed : null;
}

/** Pull profile picture from employment detail / nested user when present. */
export function extractProfilePicture(
  detail: Record<string, unknown> | null | undefined,
  listItem?: Record<string, unknown> | null,
): string | null {
  const buckets: Array<Record<string, unknown> | null | undefined> = [
    detail,
    listItem,
  ];
  const user = detail?.user;
  if (user && typeof user === "object" && user !== null) {
    buckets.push(user as Record<string, unknown>);
  }

  for (const bucket of buckets) {
    if (!bucket) continue;
    for (const key of [
      "profile_picture",
      "profilePicture",
      "profile_picture_url",
      "profilePictureUrl",
      "photo",
      "avatar_url",
      "avatarUrl",
    ]) {
      const hit = readPictureCandidate(bucket[key]);
      if (hit) return hit;
    }
  }
  return null;
}

/** Only returns a URL when Remote (or an allowlisted CDN) provided one. */
export function resolveAvatarSrc(options: {
  avatarUrl?: string | null;
}): string | null {
  const remote = options.avatarUrl?.trim();
  if (remote && isAllowedAvatarUrl(remote)) return remote;
  return null;
}
