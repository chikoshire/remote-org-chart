import { describe, expect, it } from "vitest";
import {
  listSyncRuns,
  sanitizeSyncError,
  writeSyncRun,
} from "@/lib/org/sync-runs";

describe("sync-runs", () => {
  it("redacts token-like fragments from error summaries", () => {
    expect(
      sanitizeSyncError("fail Bearer ra_test_abc123XYZ and REMOTE_API_TOKEN=secret"),
    ).toBe("fail Bearer [redacted] and REMOTE_API_TOKEN");
  });

  it("writes and lists runs through a fake D1", async () => {
    const rows: Array<Record<string, unknown>> = [];
    const db = {
      prepare(query: string) {
        return {
          bind(...values: unknown[]) {
            return {
              async run() {
                if (query.includes("INSERT")) {
                  rows.unshift({
                    id: rows.length + 1,
                    started_at: values[0],
                    finished_at: values[1],
                    ok: values[2],
                    employment_count: values[3],
                    error_summary: values[4],
                    trigger: values[5],
                  });
                }
              },
              async all() {
                return { results: rows.slice(0, Number(values[0] ?? 20)) };
              },
            };
          },
        };
      },
    };

    await writeSyncRun(
      {
        startedAt: "2026-07-24T12:00:00.000Z",
        finishedAt: "2026-07-24T12:00:05.000Z",
        ok: true,
        employmentCount: 149,
        trigger: "refresh",
      },
      db,
    );
    await writeSyncRun(
      {
        startedAt: "2026-07-24T12:01:00.000Z",
        finishedAt: "2026-07-24T12:01:01.000Z",
        ok: false,
        errorSummary: "Bearer ra_test_should_hide",
        trigger: "cold",
      },
      db,
    );

    const listed = await listSyncRuns(10, db);
    expect(listed).toHaveLength(2);
    expect(listed[0]?.ok).toBe(false);
    expect(listed[0]?.errorSummary).toBe("Bearer [redacted]");
    expect(listed[1]?.employmentCount).toBe(149);
  });
});
