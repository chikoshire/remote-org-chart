"use client";

import { useCallback, useEffect, useState } from "react";

type WebhookEvent = {
  id: number;
  eventType: string;
  employmentId: string | null;
  receivedAt: string;
  processed: boolean;
  duplicate: boolean;
  payloadSummary: string | null;
};

type WebhookEventsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshToken?: number;
};

export function WebhookEventsPanel({
  open,
  onOpenChange,
  refreshToken = 0,
}: WebhookEventsPanelProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/webhooks/events?limit=12");
      const body = (await res.json()) as {
        ok?: boolean;
        events?: WebhookEvent[];
      };
      if (!res.ok || !body.ok) {
        setStatus("error");
        return;
      }
      setEvents(body.events ?? []);
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
      aria-label="Recent webhook events"
      className="max-h-64 overflow-auto rounded-norma-md border border-norma-border bg-norma-surface p-2 shadow-norma-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
          Webhook events
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
          Could not load webhook events.
        </p>
      ) : null}
      {status === "idle" && events.length === 0 ? (
        <p className="px-1 py-2 text-xs text-norma-ink-muted">
          No webhook deliveries yet. Configure{" "}
          <code className="font-mono text-[10px]">REMOTE_WEBHOOK_SIGNING_KEY</code>{" "}
          and subscribe Remote to{" "}
          <code className="font-mono text-[10px]">/api/webhooks/remote</code>.
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
              {event.duplicate ? " · dup" : ""}
            </p>
            <p className="text-norma-ink-muted">
              {new Date(event.receivedAt).toLocaleString()}
            </p>
            {event.payloadSummary ? (
              <p className="text-norma-ink-subtle">{event.payloadSummary}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
