"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProductShell } from "@/components/shell/ProductShell";
import { AcmeLogo } from "@/components/brand/AcmeLogo";
import type { ChartDensity } from "@/lib/org/collapse";
import {
  readAppPrefs,
  writeDensityPref,
  writeLiveDefault,
} from "@/lib/ui/prefs";

type Health = {
  ok?: boolean;
  remote?: string;
  message?: string;
};

export default function SettingsPage() {
  const [density, setDensity] = useState<ChartDensity>("comfortable");
  const [liveDefault, setLiveDefault] = useState(false);
  const [saved, setSaved] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [healthStatus, setHealthStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  useEffect(() => {
    const prefs = readAppPrefs();
    setDensity(prefs.density);
    setLiveDefault(prefs.liveDefault);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHealthStatus("loading");
    void fetch("/api/health/remote")
      .then(async (res) => {
        const body = (await res.json()) as Health;
        if (!cancelled) {
          setHealth(body);
          setHealthStatus(res.ok ? "idle" : "error");
        }
      })
      .catch(() => {
        if (!cancelled) setHealthStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(() => {
    writeDensityPref(density);
    writeLiveDefault(liveDefault);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }, [density, liveDefault]);

  const remoteOk = health?.ok === true || health?.remote === "reachable";

  return (
    <ProductShell status={<span>Settings · local browser prefs + Remote connection</span>}>
      <div className="relative min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-norma-ink-subtle">
                Acme Sandbox Corp
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian">
                Settings
              </h1>
              <p className="mt-2 max-w-lg text-sm text-norma-ink-muted">
                Workspace preferences and how this app reads organization data
                from Remote. Tokens never leave the server.
              </p>
            </div>
            <AcmeLogo withWordmark={false} />
          </div>

          <section className="mt-8 space-y-5 rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-norma-prussian">
                  Integrations
                </h2>
                <p className="mt-1 text-xs text-norma-ink-muted">
                  Connected HRIS sources powering the org chart.
                </p>
              </div>
            </div>

            <article className="rounded-norma-md border border-norma-border bg-norma-surface-muted/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-norma-prussian">
                    Remote
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-norma-ink-subtle">
                    gateway.remote-sandbox.com
                  </p>
                </div>
                <span
                  className={`rounded-norma-sm px-2 py-1 text-[11px] font-semibold ${
                    healthStatus === "loading"
                      ? "bg-norma-surface text-norma-ink-muted"
                      : remoteOk
                        ? "bg-norma-success-soft text-norma-success"
                        : "bg-norma-danger-soft text-norma-danger"
                  }`}
                >
                  {healthStatus === "loading"
                    ? "Checking…"
                    : remoteOk
                      ? "Connected · read-only"
                      : "Unreachable"}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-norma-ink-subtle">Auth</dt>
                  <dd className="mt-0.5 font-medium text-norma-prussian">
                    Server-side Bearer token
                  </dd>
                </div>
                <div>
                  <dt className="text-norma-ink-subtle">Scope</dt>
                  <dd className="mt-0.5 font-medium text-norma-prussian">
                    Employments · hierarchy (read)
                  </dd>
                </div>
                <div>
                  <dt className="text-norma-ink-subtle">Sync</dt>
                  <dd className="mt-0.5 font-medium text-norma-prussian">
                    KV snapshot + optional webhooks
                  </dd>
                </div>
                <div>
                  <dt className="text-norma-ink-subtle">Data path</dt>
                  <dd className="mt-0.5 font-medium text-norma-prussian">
                    REST via /api/* (not MCP)
                  </dd>
                </div>
              </dl>
              <ol className="mt-4 space-y-2 border-t border-norma-border pt-3 text-xs leading-relaxed text-norma-ink-muted">
                <li>
                  <span className="font-semibold text-norma-prussian">1.</span>{" "}
                  App calls Remote employments APIs with a server-only token.
                </li>
                <li>
                  <span className="font-semibold text-norma-prussian">2.</span>{" "}
                  Responses are validated, emails stripped, and shaped into a
                  manager → reports forest.
                </li>
                <li>
                  <span className="font-semibold text-norma-prussian">3.</span>{" "}
                  Chart and directory render from that forest; Refresh rebuilds
                  from Remote.
                </li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/app"
                  className="rounded-norma-sm bg-[#1a1a1a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2a2a2a]"
                >
                  Open org chart
                </Link>
                <a
                  href="/api/health/remote"
                  className="rounded-norma-sm border border-norma-border px-3 py-2 text-xs font-medium text-norma-ink-muted hover:text-norma-prussian"
                >
                  Health JSON
                </a>
              </div>
            </article>

            <article className="rounded-norma-md border border-dashed border-norma-border-strong bg-norma-surface p-4 opacity-90">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-norma-prussian">
                    Add integration
                  </p>
                  <p className="mt-1 text-xs text-norma-ink-muted">
                    Additional HRIS / identity sources are not wired in this
                    assessment build. Remote remains the single source of truth.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="shrink-0 rounded-norma-sm border border-norma-border px-3 py-2 text-xs font-medium text-norma-ink-subtle"
                  title="Not available in this assessment build"
                >
                  Coming soon
                </button>
              </div>
            </article>
          </section>

          <section className="mt-6 space-y-6 rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <div>
              <h2 className="text-sm font-semibold text-norma-prussian">
                Chart preferences
              </h2>
              <p className="mt-1 text-xs text-norma-ink-muted">
                Stored in this browser only.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
                Density
              </h3>
              <div
                className="mt-3 flex gap-2"
                role="group"
                aria-label="Default density"
              >
                <button
                  type="button"
                  aria-pressed={density === "comfortable"}
                  className={`rounded-norma-sm px-3 py-2 text-sm font-medium ${
                    density === "comfortable"
                      ? "bg-[#e85d04] text-[#1a1a1a]"
                      : "border border-norma-border text-norma-ink-muted"
                  }`}
                  onClick={() => setDensity("comfortable")}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  aria-pressed={density === "compact"}
                  className={`rounded-norma-sm px-3 py-2 text-sm font-medium ${
                    density === "compact"
                      ? "bg-[#e85d04] text-[#1a1a1a]"
                      : "border border-norma-border text-norma-ink-muted"
                  }`}
                  onClick={() => setDensity("compact")}
                >
                  Compact
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
                Live updates
              </h3>
              <label className="mt-3 flex items-center gap-2 text-sm text-norma-prussian">
                <input
                  type="checkbox"
                  checked={liveDefault}
                  onChange={(e) => setLiveDefault(e.target.checked)}
                />
                Enable Live by default when Org opens
              </label>
              <p className="mt-2 text-xs leading-relaxed text-norma-ink-muted">
                Live listens for webhook-driven refreshes. Compare mode lives
                under Tools on the Org workspace: pick two people to see
                reporting distance.
              </p>
            </div>

            <button
              type="button"
              onClick={save}
              className="rounded-norma-sm bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2a]"
            >
              {saved ? "Saved" : "Save preferences"}
            </button>
          </section>

          <section className="mt-6 rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <h2 className="text-sm font-semibold text-norma-prussian">
              About this data
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-norma-ink-muted">
              People and reporting lines come from the Remote sandbox API
              (read-only token, server-side). PNG/SVG export is not part of the
              product UI. Marketing landing remains at{" "}
              <Link href="/welcome" className="text-norma-royal hover:underline">
                /welcome
              </Link>{" "}
              for interviewers — it is not primary navigation.
            </p>
          </section>
        </div>
      </div>
    </ProductShell>
  );
}
