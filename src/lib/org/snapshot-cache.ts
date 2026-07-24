import { getCloudflareContext } from "@opennextjs/cloudflare";

/** KV key for the derived org-chart JSON snapshot (not raw employments). */
export const ORG_CHART_CACHE_KEY = "org-chart:v1:active";

/**
 * Stale policy: KV entries expire after this TTL. Manual refresh (`?refresh=1`)
 * bypasses the cache and rewrites the snapshot immediately.
 */
export const ORG_CHART_CACHE_TTL_SECONDS = 15 * 60;

export type OrgChartCachePayload = {
  ok: true;
  nodeCount: number;
  rootCount: number;
  cycleCount: number;
  orphanManagerCount: number;
  roots: unknown[];
  nodes: unknown[];
  lastSyncedAt: string;
};

type KvLike = {
  get(key: string, type: "json"): Promise<OrgChartCachePayload | null>;
  get(key: string, type: "text"): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
};

/** Bumped when the snapshot is invalidated so SSE clients can refetch. */
export const ORG_CHART_NOTIFY_KEY = "org-chart:v1:notify";

export function getOrgChartKv(): KvLike | null {
  try {
    const { env } = getCloudflareContext();
    const binding = (env as { ORG_CHART_CACHE?: KvLike }).ORG_CHART_CACHE;
    return binding ?? null;
  } catch {
    return null;
  }
}

export async function readOrgChartSnapshot(
  kv: KvLike | null = getOrgChartKv(),
): Promise<OrgChartCachePayload | null> {
  if (!kv) return null;
  try {
    return await kv.get(ORG_CHART_CACHE_KEY, "json");
  } catch {
    return null;
  }
}

export async function writeOrgChartSnapshot(
  payload: Omit<OrgChartCachePayload, "lastSyncedAt"> & {
    lastSyncedAt?: string;
  },
  kv: KvLike | null = getOrgChartKv(),
): Promise<OrgChartCachePayload> {
  const snapshot: OrgChartCachePayload = {
    ...payload,
    ok: true,
    lastSyncedAt: payload.lastSyncedAt ?? new Date().toISOString(),
  };
  if (kv) {
    await kv.put(ORG_CHART_CACHE_KEY, JSON.stringify(snapshot), {
      expirationTtl: ORG_CHART_CACHE_TTL_SECONDS,
    });
    await kv.put(ORG_CHART_NOTIFY_KEY, snapshot.lastSyncedAt, {
      expirationTtl: ORG_CHART_CACHE_TTL_SECONDS,
    });
  }
  return snapshot;
}

export async function invalidateOrgChartSnapshot(
  kv: KvLike | null = getOrgChartKv(),
): Promise<string | null> {
  if (!kv) return null;
  await kv.delete(ORG_CHART_CACHE_KEY);
  const at = new Date().toISOString();
  await kv.put(ORG_CHART_NOTIFY_KEY, at, {
    expirationTtl: ORG_CHART_CACHE_TTL_SECONDS,
  });
  return at;
}

export async function readOrgChartNotifyAt(
  kv: KvLike | null = getOrgChartKv(),
): Promise<string | null> {
  if (!kv) return null;
  try {
    return await kv.get(ORG_CHART_NOTIFY_KEY, "text");
  } catch {
    return null;
  }
}
