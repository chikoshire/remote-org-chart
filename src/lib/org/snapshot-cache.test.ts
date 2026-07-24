import { describe, expect, it } from "vitest";
import {
  ORG_CHART_CACHE_KEY,
  ORG_CHART_CACHE_TTL_SECONDS,
  invalidateOrgChartSnapshot,
  readOrgChartSnapshot,
  writeOrgChartSnapshot,
} from "@/lib/org/snapshot-cache";

describe("snapshot-cache", () => {
  it("documents TTL and key", () => {
    expect(ORG_CHART_CACHE_KEY).toBe("org-chart:v1:active");
    expect(ORG_CHART_CACHE_TTL_SECONDS).toBe(3600);
  });

  it("round-trips through a fake KV and supports invalidate", async () => {
    const store = new Map<string, string>();
    const kv = {
      async get(key: string, type: "json" | "text") {
        const raw = store.get(key);
        if (raw == null) return null;
        if (type === "json") return JSON.parse(raw) as never;
        return raw;
      },
      async put(key: string, value: string, options?: { expirationTtl?: number }) {
        expect(options?.expirationTtl).toBe(ORG_CHART_CACHE_TTL_SECONDS);
        store.set(key, value);
      },
      async delete(key: string) {
        store.delete(key);
      },
    };

    expect(await readOrgChartSnapshot(kv as never)).toBeNull();
    const written = await writeOrgChartSnapshot(
      {
        ok: true,
        nodeCount: 2,
        rootCount: 1,
        cycleCount: 0,
        orphanManagerCount: 0,
        roots: [],
        nodes: [],
        lastSyncedAt: "2026-07-24T12:00:00.000Z",
      },
      kv as never,
    );
    expect(written.lastSyncedAt).toBe("2026-07-24T12:00:00.000Z");
    expect(await readOrgChartSnapshot(kv as never)).toEqual(written);
    await invalidateOrgChartSnapshot(kv as never);
    expect(await readOrgChartSnapshot(kv as never)).toBeNull();
  });
});
