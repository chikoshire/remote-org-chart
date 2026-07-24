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
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

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
  }
  return snapshot;
}
