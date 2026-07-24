"use client";

import { useCallback, useEffect, useState } from "react";

type SyncRun = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  ok: boolean;
  employmentCount: number | null;
  errorSummary: string | null;
  trigger: string;
};

type SyncRunsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bump to refetch after a manual refresh. */
  refreshToken?: number;
};

export function SyncRunsPanel({
  open,
  onOpenChange,
  refreshToken = 0,
}: SyncRunsPanelProps) {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/sync-runs?limit=12");
      const body = (await res.json()) as { ok?: boolean; runs?: SyncRun[] };
      if (!res.ok || !body.ok) {
        setStatus("error");
        return;
      }
      setRuns(body.runs ?? []);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [load, open, refreshToken]);

  return (
    <div className="pointer-events-auto absolute bottom-14 left-3 z-20 w-[min(100%-1.5rem,18rem)] md:bottom-12">
      <button
        type="button"
        aria-expanded={open}
        className="rounded-norma-md border border-norma-border bg-norma-surface px-3 py-1.5 text-[11px] font-medium text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian"
        onClick={() => onOpenChange(!open)}
      >
        {open ? "Hide sync log" : "Sync log"}
      </button>
      {open ? (
        <div
          role="region"
          aria-label="Recent sync runs"
          className="mt-1 max-h-64 overflow-auto rounded-norma-md border border-norma-border bg-norma-surface p-2 shadow-norma-md"
        >
          {status === "loading" ? (
            <p className="px-1 py-2 text-xs text-norma-ink-muted">Loading…</p>
          ) : null}
          {status === "error" ? (
            <p className="px-1 py-2 text-xs text-norma-danger">
              Could not load sync history.
            </p>
          ) : null}
          {status === "idle" && runs.length === 0 ? (
            <p className="px-1 py-2 text-xs text-norma-ink-muted">
              No sync runs yet (local dev has no D1, or none recorded).
            </p>
          ) : null}
          <ul className="space-y-1.5">
            {runs.map((run) => (
              <li
                key={run.id}
                className="rounded-norma-sm border border-norma-border/70 px-2 py-1.5 text-[11px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      run.ok ? "font-medium text-norma-prussian" : "font-medium text-norma-danger"
                    }
                  >
                    {run.ok ? "OK" : "Fail"} · {run.trigger}
                  </span>
                  <span className="text-norma-ink-subtle">
                    {run.employmentCount != null ? `${run.employmentCount} people` : "—"}
                  </span>
                </div>
                <p className="mt-0.5 text-norma-ink-muted">
                  {new Date(run.startedAt).toLocaleString()}
                </p>
                {run.errorSummary ? (
                  <p className="mt-0.5 text-norma-danger">{run.errorSummary}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
