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

export function getRemoteEnv(
  source: NodeJS.ProcessEnv = process.env,
): RemoteEnv {
  return remoteEnvSchema.parse({
    REMOTE_API_TOKEN: source.REMOTE_API_TOKEN,
    REMOTE_API_BASE_URL:
      source.REMOTE_API_BASE_URL ?? "https://gateway.remote-sandbox.com",
  });
}
