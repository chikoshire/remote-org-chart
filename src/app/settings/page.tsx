"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductShell } from "@/components/shell/ProductShell";
import type { ChartDensity } from "@/lib/org/collapse";
import {
  readAppPrefs,
  writeDensityPref,
  writeLiveDefault,
} from "@/lib/ui/prefs";

export default function SettingsPage() {
  const [density, setDensity] = useState<ChartDensity>("comfortable");
  const [liveDefault, setLiveDefault] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prefs = readAppPrefs();
    setDensity(prefs.density);
    setLiveDefault(prefs.liveDefault);
  }, []);

  const save = useCallback(() => {
    writeDensityPref(density);
    writeLiveDefault(liveDefault);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }, [density, liveDefault]);

  return (
    <ProductShell status={<span>Settings · stored locally in this browser</span>}>
      <div className="mx-auto w-full max-w-xl flex-1 overflow-auto px-4 py-8 md:px-6">
        <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian">
          Settings
        </h1>
        <p className="mt-2 text-sm text-norma-ink-muted">
          Preferences apply on the Org workspace. They stay in this browser only.
        </p>

        <section className="mt-8 space-y-6 rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
          <div>
            <h2 className="text-sm font-semibold text-norma-prussian">
              Chart density
            </h2>
            <p className="mt-1 text-xs text-norma-ink-muted">
              Default node size when the org chart loads.
            </p>
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
                    ? "bg-[#e85d04] text-[#0b2a32]"
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
                    ? "bg-[#e85d04] text-[#0b2a32]"
                    : "border border-norma-border text-norma-ink-muted"
                }`}
                onClick={() => setDensity("compact")}
              >
                Compact
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-norma-prussian">
              Live updates
            </h2>
            <p className="mt-1 text-xs text-norma-ink-muted">
              When on, Org starts with Live listening for webhook-driven refreshes.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-norma-prussian">
              <input
                type="checkbox"
                checked={liveDefault}
                onChange={(e) => setLiveDefault(e.target.checked)}
              />
              Enable Live by default
            </label>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-norma-prussian">
              Compare reporting distance
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-norma-ink-muted">
              On Org, open Tools → Compare, then click two people on the chart.
              The path between them highlights so you can see how many hops
              apart they are in the reporting tree.
            </p>
          </div>

          <div className="border-t border-norma-border pt-4">
            <h2 className="text-sm font-semibold text-norma-prussian">
              About this data
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-norma-ink-muted">
              People and reporting lines come from the Remote sandbox API
              (read-only token, server-side). PNG/SVG export is not part of the
              product UI — the graph and directory are the primary surfaces.
            </p>
          </div>

          <button
            type="button"
            onClick={save}
            className="rounded-norma-sm bg-[#0b2a32] px-4 py-2 text-sm font-semibold text-[#f4f7f5] hover:bg-[#143a44]"
          >
            {saved ? "Saved" : "Save preferences"}
          </button>
        </section>
      </div>
    </ProductShell>
  );
}
