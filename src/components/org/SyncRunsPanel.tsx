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

type WebhookEvent = {
  id: number;
  eventType: string;
  employmentId: string | null;
  receivedAt: string;
  duplicate: boolean;
  payloadSummary: string | null;
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
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/sync-runs?limit=12");
      const body = (await res.json()) as {
        ok?: boolean;
        runs?: SyncRun[];
        webhookEvents?: WebhookEvent[];
      };
      if (!res.ok || !body.ok) {
        setStatus("error");
        return;
      }
      setRuns(body.runs ?? []);
      setEvents(body.webhookEvents ?? []);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [load, open, refreshToken]);

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Recent sync runs and webhook events"
      className="max-h-72 overflow-auto rounded-norma-md border border-norma-border bg-norma-surface p-2 shadow-norma-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
          Sync log
        </p>
        <button
          type="button"
          className="text-[11px] font-medium text-norma-royal hover:underline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      </div>
      {status === "loading" ? (
        <p className="px-1 py-2 text-xs text-norma-ink-muted">Loading…</p>
      ) : null}
      {status === "error" ? (
        <p className="px-1 py-2 text-xs text-norma-danger">
          Could not load sync history.
        </p>
      ) : null}

      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
        Sync runs
      </p>
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
                  run.ok
                    ? "font-medium text-norma-prussian"
                    : "font-medium text-norma-danger"
                }
              >
                {run.ok ? "OK" : "Fail"} · {run.trigger}
              </span>
              <span className="text-norma-ink-subtle">
                {run.employmentCount != null
                  ? `${run.employmentCount} people`
                  : "—"}
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

      <p className="mt-3 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
        Webhook events
      </p>
      {status === "idle" && events.length === 0 ? (
        <p className="px-1 py-2 text-xs text-norma-ink-muted">
          No webhook deliveries yet. Configure{" "}
          <code className="font-mono">REMOTE_WEBHOOK_SIGNING_KEY</code> and
          subscribe employment.* events.
        </p>
      ) : null}
      <ul className="space-y-1.5">
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-norma-sm border border-norma-border/70 px-2 py-1.5 text-[11px]"
          >
            <p className="font-medium text-norma-prussian">
              {event.eventType}
              {event.duplicate ? " · duplicate" : ""}
            </p>
            <p className="mt-0.5 text-norma-ink-muted">
              {new Date(event.receivedAt).toLocaleString()}
            </p>
            {event.payloadSummary ? (
              <p className="mt-0.5 text-norma-ink-subtle">
                {event.payloadSummary}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-2 border-t border-norma-border/70 px-1 pt-2 text-[10px] text-norma-ink-subtle">
        Counts / event types only — no emails. Storage: D1.
      </p>
    </div>
  );
}
