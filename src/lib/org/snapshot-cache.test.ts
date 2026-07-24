import { describe, expect, it } from "vitest";
import {
  ORG_CHART_CACHE_KEY,
  ORG_CHART_CACHE_TTL_SECONDS,
  readOrgChartSnapshot,
  writeOrgChartSnapshot,
} from "@/lib/org/snapshot-cache";

describe("snapshot-cache", () => {
  it("documents TTL and key", () => {
    expect(ORG_CHART_CACHE_KEY).toBe("org-chart:v1:active");
    expect(ORG_CHART_CACHE_TTL_SECONDS).toBe(900);
  });

  it("round-trips through a fake KV", async () => {
    const store = new Map<string, string>();
    const kv = {
      async get(key: string, type: "json") {
        expect(type).toBe("json");
        const raw = store.get(key);
        return raw ? (JSON.parse(raw) as never) : null;
      },
      async put(key: string, value: string, options?: { expirationTtl?: number }) {
        expect(options?.expirationTtl).toBe(ORG_CHART_CACHE_TTL_SECONDS);
        store.set(key, value);
      },
    };

    expect(await readOrgChartSnapshot(kv)).toBeNull();
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
      kv,
    );
    expect(written.lastSyncedAt).toBe("2026-07-24T12:00:00.000Z");
    expect(await readOrgChartSnapshot(kv)).toEqual(written);
  });
});
