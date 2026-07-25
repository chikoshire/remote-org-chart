import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Write-scoped Remote token for employment PATCH (and webhook subscribe).
 * Keep separate from read-only `REMOTE_API_TOKEN`.
 */
export function getRemoteWriteToken(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | null {
  const fromCf =
    source === process.env ? readCloudflareWriteBindings() : {};
  const token =
    source.REMOTE_API_WRITE_TOKEN?.trim() ||
    fromCf.REMOTE_API_WRITE_TOKEN?.trim() ||
    source.REMOTE_WEBHOOK_ADMIN_TOKEN?.trim() ||
    fromCf.REMOTE_WEBHOOK_ADMIN_TOKEN?.trim() ||
    "";
  return token || null;
}

function readCloudflareWriteBindings(): Record<string, string | undefined> {
  try {
    const { env } = getCloudflareContext();
    const bindings = env as unknown as Record<string, unknown>;
    return {
      REMOTE_API_WRITE_TOKEN:
        typeof bindings.REMOTE_API_WRITE_TOKEN === "string"
          ? bindings.REMOTE_API_WRITE_TOKEN
          : undefined,
      REMOTE_WEBHOOK_ADMIN_TOKEN:
        typeof bindings.REMOTE_WEBHOOK_ADMIN_TOKEN === "string"
          ? bindings.REMOTE_WEBHOOK_ADMIN_TOKEN
          : undefined,
    };
  } catch {
    return {};
  }
}
