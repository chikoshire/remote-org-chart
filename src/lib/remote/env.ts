import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";

const remoteEnvSchema = z.object({
  REMOTE_API_TOKEN: z
    .string()
    .min(1, "REMOTE_API_TOKEN is required")
    .refine((v) => !v.includes(" "), "REMOTE_API_TOKEN must not contain spaces"),
  REMOTE_API_BASE_URL: z
    .string()
    .url()
    .default("https://gateway.remote-sandbox.com"),
});

export type RemoteEnv = z.infer<typeof remoteEnvSchema>;

function readCloudflareBindings(): Record<string, string | undefined> {
  try {
    const { env } = getCloudflareContext();
    const bindings = env as Record<string, unknown>;
    return {
      REMOTE_API_TOKEN:
        typeof bindings.REMOTE_API_TOKEN === "string"
          ? bindings.REMOTE_API_TOKEN
          : undefined,
      REMOTE_API_BASE_URL:
        typeof bindings.REMOTE_API_BASE_URL === "string"
          ? bindings.REMOTE_API_BASE_URL
          : undefined,
    };
  } catch {
    // Local `next dev` without Workers bindings.
    return {};
  }
}

export function getRemoteEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): RemoteEnv {
  const fromCf = source === process.env ? readCloudflareBindings() : {};
  return remoteEnvSchema.parse({
    REMOTE_API_TOKEN: source.REMOTE_API_TOKEN ?? fromCf.REMOTE_API_TOKEN,
    REMOTE_API_BASE_URL:
      source.REMOTE_API_BASE_URL ??
      fromCf.REMOTE_API_BASE_URL ??
      "https://gateway.remote-sandbox.com",
  });
}
