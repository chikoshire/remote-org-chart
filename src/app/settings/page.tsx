"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductShell } from "@/components/shell/ProductShell";
import { ProductPageFrame } from "@/components/shell/ProductPageFrame";
import { AcmeLogo } from "@/components/brand/AcmeLogo";
import { RemoteConnectWizard } from "@/components/settings/RemoteConnectWizard";
import type { ChartDensity } from "@/lib/org/collapse";
import {
  readAppPrefs,
  writeDensityPref,
  writeLiveDefault,
  writeThemePref,
  applyThemeClass,
  type AppTheme,
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
  const [theme, setTheme] = useState<AppTheme>("light");
  const [saved, setSaved] = useState(false);
  const [connected, setConnected] = useState(true);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const prefs = readAppPrefs();
    setDensity(prefs.density);
    setLiveDefault(prefs.liveDefault);
    setTheme(prefs.theme);
    setConnected(readRemoteConnected());
    applyThemeClass(prefs.theme);  }, []);

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
    writeThemePref(theme);
    applyThemeClass(theme);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }, [density, liveDefault, theme]);

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
      <ProductPageFrame>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-norma-ink-subtle">
                Acme
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian">
                Preferences
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-norma-ink-muted">
                Manage how Acme connects to Remote and how the org chart looks
                for you.
              </p>
            </div>
            <AcmeLogo withWordmark={false} />
          </div>

          <section className="mt-8 rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <h2 className="text-sm font-semibold text-norma-prussian">
              Integrations
            </h2>
            <p className="mt-1 text-xs text-norma-ink-muted">
              People data for the org chart.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-norma-md border border-norma-border bg-norma-surface-muted/50 px-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-norma-prussian">
                  Remote
                </p>
                <p className="mt-0.5 text-xs text-norma-ink-muted">
                  HR platform · employments &amp; reporting lines
                </p>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    liveConnected ? "text-norma-success" : "text-norma-ink-muted"
                  }`}
                >
                  {liveConnected
                    ? "Connected"
                    : connected
                      ? "Connecting…"
                      : "Disconnected"}
                </p>
              </div>
              {connected ? (
                <button
                  type="button"
                  onClick={disconnect}
                  className="rounded-norma-sm border border-norma-border bg-white px-4 py-2 text-sm font-medium text-norma-prussian hover:border-norma-danger hover:text-norma-danger"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="rounded-norma-sm bg-[#e85d04] px-4 py-2 text-sm font-semibold text-norma-prussian hover:bg-[#ff7a2f]"
                >
                  Connect
                </button>
              )}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-norma-ink-muted">
              Disconnect pauses org data in this browser. Connect walks through
              a short wizard and turns data back on instantly. Company
              credentials stay on the server. This is not a Remote OAuth login
              redirect.
            </p>
            {wizardOpen && !connected ? (
              <RemoteConnectWizard
                healthOk={healthOk}
                onConnected={finishConnect}
                onCancel={() => setWizardOpen(false)}
              />
            ) : null}
          </section>

          <section className="mt-6 space-y-5 rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <div>
              <h2 className="text-sm font-semibold text-norma-prussian">
                Chart preferences
              </h2>
              <p className="mt-1 text-xs text-norma-ink-muted">
                Saved on this device only.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
                Card size
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
                      ? "bg-[#e85d04] text-norma-prussian"
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
                      ? "bg-[#e85d04] text-norma-prussian"
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
                Appearance
              </h3>
              <div
                className="mt-3 flex gap-2"
                role="group"
                aria-label="Color theme"
              >
                <button
                  type="button"
                  aria-pressed={theme === "light"}
                  className={`rounded-norma-sm px-3 py-2 text-sm font-medium ${
                    theme === "light"
                      ? "bg-[#e85d04] text-norma-prussian"
                      : "border border-norma-border text-norma-ink-muted"
                  }`}
                  onClick={() => {
                    setTheme("light");
                    applyThemeClass("light");
                  }}
                >
                  Light
                </button>
                <button
                  type="button"
                  aria-pressed={theme === "dark"}
                  className={`rounded-norma-sm px-3 py-2 text-sm font-medium ${
                    theme === "dark"
                      ? "bg-[#e85d04] text-norma-prussian"
                      : "border border-norma-border text-norma-ink-muted"
                  }`}
                  onClick={() => {
                    setTheme("dark");
                    applyThemeClass("dark");
                  }}
                >
                  Dark
                </button>
              </div>
              <p className="mt-2 text-xs text-norma-ink-muted">
                Theme is controlled here only. It is saved on this device.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm text-norma-prussian">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={liveDefault}
                onChange={(e) => setLiveDefault(e.target.checked)}
              />
              <span>
                Automatically refresh when Remote sends updates
                <span className="mt-0.5 block text-xs font-normal text-norma-ink-muted">
                  Turn this on if you want the chart to stay current during a
                  live demo.
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={save}
              className="rounded-norma-sm bg-norma-prussian px-4 py-2 text-sm font-semibold text-white hover:bg-[#143a44]"
            >
              {saved ? "Saved" : "Save preferences"}
            </button>
          </section>
      </ProductPageFrame>
    </ProductShell>
  );
}
