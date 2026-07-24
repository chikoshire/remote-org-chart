"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductShell } from "@/components/shell/ProductShell";
import { ProductPageFrame } from "@/components/shell/ProductPageFrame";
import { RemoteConnectWizard } from "@/components/settings/RemoteConnectWizard";
import { DensityPreview } from "@/components/settings/DensityPreview";
import { SettingsChrome } from "@/components/settings/SettingsChrome";
import { RemoteMark } from "@/components/brand/RemoteMark";
import type { ChartDensity } from "@/lib/org/collapse";
import {
  forceLightTheme,
  readAppPrefs,
  writeDensityPref,
  writeLiveDefault,
} from "@/lib/ui/prefs";
import {
  clearSessionOrgPayload,
  readRemoteConnected,
  writeRemoteConnected,
} from "@/lib/ui/remote-connection";

type Health = {
  ok?: boolean;
  remote?: string;
};

export default function SettingsPage() {
  const [density, setDensity] = useState<ChartDensity>("comfortable");
  const [liveDefault, setLiveDefault] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connected, setConnected] = useState(true);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const prefs = readAppPrefs();
    setDensity(prefs.density);
    setLiveDefault(prefs.liveDefault);
    setConnected(readRemoteConnected());
    forceLightTheme();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/health/remote")
      .then(async (res) => {
        const body = (await res.json()) as Health;
        if (!cancelled) {
          setHealthOk(res.ok && (body.ok === true || body.remote === "reachable"));
        }
      })
      .catch(() => {
        if (!cancelled) setHealthOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(() => {
    writeDensityPref(density);
    writeLiveDefault(liveDefault);
    forceLightTheme();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }, [density, liveDefault]);

  const disconnect = () => {
    writeRemoteConnected(false);
    clearSessionOrgPayload();
    setConnected(false);
    setWizardOpen(false);
  };

  const finishConnect = () => {
    writeRemoteConnected(true);
    setConnected(true);
  };

  const liveConnected = connected && healthOk !== false;

  return (
    <ProductShell status={<span>Preferences</span>}>
      <SettingsChrome>
        <ProductPageFrame>
          <div>
            <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
              Preferences
            </h1>
            <p className="mt-1 text-sm text-norma-ink-muted">
              Remote connection and chart appearance on this device
            </p>
          </div>

          <section className="mt-6 rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-norma-ink">
                  Integrations
                </h2>
                <p className="mt-0.5 text-xs text-norma-ink-muted">
                  People data source
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-norma-md border border-norma-border/80 bg-gradient-to-br from-norma-surface to-norma-surface-muted/60 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-norma-md bg-white shadow-norma-sm ring-1 ring-norma-border/80">
                  <RemoteMark className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-norma-ink">
                    Remote
                  </p>
                  <p className="text-xs text-norma-ink-muted">
                    Employments &amp; reporting lines
                  </p>
                </div>
                <span
                  className={`ml-1 rounded-norma-sm px-2 py-0.5 text-[11px] font-semibold ${
                    liveConnected
                      ? "bg-norma-success-soft text-norma-success"
                      : connected
                        ? "bg-amber-100 text-amber-900"
                        : "bg-norma-surface-muted text-norma-ink-muted"
                  }`}
                >
                  {liveConnected
                    ? "Connected"
                    : connected
                      ? "Connecting…"
                      : "Disconnected"}
                </span>
              </div>
              {connected ? (
                <button
                  type="button"
                  onClick={disconnect}
                  className="rounded-norma-sm border border-norma-border bg-norma-surface px-4 py-2 text-sm font-medium text-norma-ink hover:border-norma-danger hover:text-norma-danger"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="norma-cta px-5 py-2 text-sm"
                >
                  Connect
                </button>
              )}
            </div>
            <p className="mt-3 text-xs text-norma-ink-muted">
              Disconnect pauses org data in this browser. Credentials stay on the
              server. This is not a Remote OAuth login — the company token is
              already configured server-side.
            </p>
            {wizardOpen && !connected ? (
              <RemoteConnectWizard
                healthOk={healthOk}
                onConnected={finishConnect}
                onCancel={() => setWizardOpen(false)}
              />
            ) : null}
          </section>

          <section className="mt-5 rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm backdrop-blur-sm">
            <div>
              <h2 className="text-sm font-semibold text-norma-ink">
                Chart preferences
              </h2>
              <p className="mt-0.5 text-xs text-norma-ink-muted">
                Saved on this device · preview updates as you choose
              </p>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
                    Card size
                  </h3>
                  <div
                    className="mt-3 inline-flex gap-1 rounded-full border border-norma-border bg-norma-surface-muted/50 p-1"
                    role="group"
                    aria-label="Default density"
                  >
                    <button
                      type="button"
                      aria-pressed={density === "comfortable"}
                      className={`rounded-full px-3 py-2 text-sm font-medium ${
                        density === "comfortable"
                          ? "bg-norma-ink text-norma-ink-inverse shadow-norma-sm"
                          : "text-norma-ink hover:bg-white/80"
                      }`}
                      onClick={() => {
                        setDensity("comfortable");
                        writeDensityPref("comfortable");
                      }}
                    >
                      Comfortable
                    </button>
                    <button
                      type="button"
                      aria-pressed={density === "compact"}
                      className={`rounded-full px-3 py-2 text-sm font-medium ${
                        density === "compact"
                          ? "bg-norma-ink text-norma-ink-inverse shadow-norma-sm"
                          : "text-norma-ink hover:bg-white/80"
                      }`}
                      onClick={() => {
                        setDensity("compact");
                        writeDensityPref("compact");
                      }}
                    >
                      Compact
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-norma-ink-muted">
                    Applies on the org chart as soon as you choose — Save keeps
                    it for next visits.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 text-sm text-norma-ink">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={liveDefault}
                    onChange={(e) => {
                      setLiveDefault(e.target.checked);
                      writeLiveDefault(e.target.checked);
                    }}
                  />
                  <span>
                    Auto-refresh when Remote sends updates
                    <span className="mt-0.5 block text-xs font-normal text-norma-ink-muted">
                      Useful for live demos
                    </span>
                  </span>
                </label>

                <button
                  type="button"
                  onClick={save}
                  className="norma-cta px-5 py-2 text-sm"
                >
                  {saved ? "Saved" : "Save preferences"}
                </button>
              </div>

              <DensityPreview density={density} />
            </div>
          </section>
        </ProductPageFrame>
      </SettingsChrome>
    </ProductShell>
  );
}
