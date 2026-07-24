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
  const gapY = compact ? "my-1.5" : "my-2.5";
  const gapX = compact ? "gap-2.5" : "gap-4";

  return (
    <div
      className="flex h-full min-h-[28rem] flex-col rounded-norma-lg border border-norma-border/70 bg-gradient-to-br from-norma-lavender/40 via-norma-surface to-norma-mint/30 p-5 shadow-norma-sm md:min-h-[32rem] md:p-6"
      aria-live="polite"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
        Live preview · {compact ? "Compact" : "Comfortable"}
      </p>
      <p className="mt-1 text-xs text-norma-ink-muted">
        Matches org chart card size after you save
      </p>
      <div className="mt-6 flex flex-1 items-center justify-center overflow-auto py-2">
        <div className="pointer-events-none select-none">
          <div className="flex justify-center">
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
          </div>
          <div
            className={`mx-auto h-7 w-px bg-norma-border ${gapY}`}
            aria-hidden
          />
          <div className={`flex justify-center ${gapX}`}>
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
          <div
            className={`mx-auto grid max-w-[34rem] grid-cols-2 ${gapY}`}
            aria-hidden
          >
            <div className="mx-auto h-7 w-px bg-norma-border" />
            <div className="mx-auto h-7 w-px bg-norma-border opacity-0" />
          </div>
          <div className={`flex justify-center ${gapX}`}>
            <PersonNodeCard
              id="preview-c"
              fullName="Jordan Diaz"
              jobTitle="Software Engineer"
              department="Engineering"
              country="PT"
              directReports={0}
              density={density}
            />
            <PersonNodeCard
              id="preview-d"
              fullName="Taylor Park"
              jobTitle="Product Designer"
              department="Design"
              country="US"
              directReports={0}
              density={density}
              variant="selected"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
