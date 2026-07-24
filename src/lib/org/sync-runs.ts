import { getCloudflareContext } from "@opennextjs/cloudflare";

export type SyncTrigger = "cold" | "refresh" | "cache_hit";

export type SyncRunRecord = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  ok: boolean;
  employmentCount: number | null;
  errorSummary: string | null;
  trigger: SyncTrigger;
};

export type SyncRunInput = {
  startedAt: string;
  finishedAt: string;
  ok: boolean;
  employmentCount?: number | null;
  errorSummary?: string | null;
  trigger: SyncTrigger;
};

type D1Like = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
      all(): Promise<{ results: Record<string, unknown>[] }>;
    };
  };
};

export type { D1Like };

/** Strip anything that looks like a bearer/token fragment from error text. */
export function sanitizeSyncError(message: string | null | undefined): string | null {
  if (!message?.trim()) return null;
  return message
    .replace(/ra_[a-z]+_[A-Za-z0-9_-]+/gi, "[redacted-token]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/REMOTE_API_TOKEN[^\s]*/gi, "REMOTE_API_TOKEN")
    .slice(0, 400);
}

export function getSyncRunsDb(): D1Like | null {
  try {
    const { env } = getCloudflareContext();
    const binding = (env as { SYNC_RUNS_DB?: D1Like }).SYNC_RUNS_DB;
    return binding ?? null;
  } catch {
    return null;
  }
}

export async function writeSyncRun(
  input: SyncRunInput,
  db: D1Like | null = getSyncRunsDb(),
): Promise<void> {
  if (!db) return;
  try {
    await db
      .prepare(
        `INSERT INTO sync_runs
          (started_at, finished_at, ok, employment_count, error_summary, trigger)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.startedAt,
        input.finishedAt,
        input.ok ? 1 : 0,
        input.employmentCount ?? null,
        sanitizeSyncError(input.errorSummary),
        input.trigger,
      )
      .run();
  } catch {
    // Local/dev D1 may lack migrations - never fail the org-chart response for telemetry.
  }
}

export async function listSyncRuns(
  limit = 20,
  db: D1Like | null = getSyncRunsDb(),
): Promise<SyncRunRecord[]> {
  if (!db) return [];
  const capped = Math.min(Math.max(limit, 1), 50);
  const { results } = await db
    .prepare(
      `SELECT id, started_at, finished_at, ok, employment_count, error_summary, trigger
       FROM sync_runs
       ORDER BY id DESC
       LIMIT ?`,
    )
    .bind(capped)
    .all();

  return results.map((row) => ({
    id: Number(row.id),
    startedAt: String(row.started_at),
    finishedAt: row.finished_at == null ? null : String(row.finished_at),
    ok: Number(row.ok) === 1,
    employmentCount:
      row.employment_count == null ? null : Number(row.employment_count),
    errorSummary:
      row.error_summary == null ? null : String(row.error_summary),
    trigger: row.trigger as SyncTrigger,
  }));
}
