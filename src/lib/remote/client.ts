import { getRemoteEnv } from "@/lib/remote/env";
import {
  mapRemoteHttpStatus,
  redactSecrets,
  toClientSafeMessage,
  type RemoteErrorBody,
} from "@/lib/remote/redact";

export class RemoteApiError extends Error {
  readonly body: RemoteErrorBody;

  constructor(body: RemoteErrorBody) {
    super(body.message);
    this.name = "RemoteApiError";
    this.body = body;
  }
}

export type RemoteFetchOptions = {
  path: string;
  searchParams?: Record<string, string | number | undefined>;
  init?: Omit<RequestInit, "headers"> & { headers?: HeadersInit };
};

function joinUrl(base: string, path: string): URL {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${normalizedBase}${normalizedPath}`);
}

export async function remoteFetch<T = unknown>(
  options: RemoteFetchOptions,
): Promise<T> {
  let env;
  try {
    env = getRemoteEnv();
  } catch (err) {
    const message =
      err instanceof Error
        ? toClientSafeMessage(err.message, "Remote API env is invalid")
        : "Remote API env is invalid";
    throw new RemoteApiError({ ok: false, code: "config", message });
  }

  const url = joinUrl(env.REMOTE_API_BASE_URL, options.path);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options.init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.REMOTE_API_TOKEN}`,
        ...(options.init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Network error";
    throw new RemoteApiError({
      ok: false,
      code: "network",
      message: toClientSafeMessage(raw, "Failed to reach Remote API"),
    });
  }

  const text = await response.text();
  const safeText = redactSecrets(text);

  if (!response.ok) {
    throw new RemoteApiError({
      ok: false,
      code: mapRemoteHttpStatus(response.status),
      message: toClientSafeMessage(
        safeText || response.statusText,
        `Remote API error (${response.status})`,
      ),
      status: response.status,
    });
  }

  if (!safeText) {
    return undefined as T;
  }

  try {
    return JSON.parse(safeText) as T;
  } catch {
    throw new RemoteApiError({
      ok: false,
      code: "upstream",
      message: "Remote API returned non-JSON",
      status: response.status,
    });
  }
}
