"use client";

import { PersonNodeCard } from "@/components/org/PersonNodeCard";
import type { ChartDensity } from "@/lib/org/collapse";

type DensityPreviewProps = {
  density: ChartDensity;
};

/**
 * Live sample of org-chart card sizing for Settings → Chart preferences.
 */
export function DensityPreview({ density }: DensityPreviewProps) {
  const compact = density === "compact";
  return (
    <div
      className="rounded-norma-lg border border-norma-border/70 bg-gradient-to-br from-norma-lavender/40 via-norma-surface to-norma-mint/30 p-4 shadow-norma-sm"
      aria-live="polite"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
        Live preview · {compact ? "Compact" : "Comfortable"}
      </p>
      <p className="mt-1 text-xs text-norma-ink-muted">
        Matches org chart card size after you save
      </p>
      <div className="mt-4 flex justify-center overflow-x-auto pb-1">
        <div className="pointer-events-none select-none">
          <PersonNodeCard
            id="preview-manager"
            fullName="Alex Morgan"
            jobTitle={
              compact ? "VP Engineering" : "Vice President of Engineering"
            }
            department="Engineering"
            country="US"
            directReports={compact ? 4 : 6}
            density={density}
            variant="root"
          />
          <div
            className={`mx-auto h-6 w-px bg-norma-border ${compact ? "my-1" : "my-2"}`}
            aria-hidden
          />
          <div
            className={`flex justify-center ${compact ? "gap-2" : "gap-3"}`}
          >
            <PersonNodeCard
              id="preview-a"
              fullName="Sam Ruiz"
              jobTitle="Eng Manager"
              department="Engineering"
              country="PT"
              directReports={2}
              density={density}
            />
            <PersonNodeCard
              id="preview-b"
              fullName="Maya Kim"
              jobTitle="Staff Engineer"
              department="Engineering"
              country="GB"
              directReports={0}
              density={density}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
