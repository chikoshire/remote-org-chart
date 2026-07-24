"use client";

const ITEMS = [
  "Org chart",
  "Reporting tree",
  "World map",
  "People directory",
  "Data health",
  "Remote sandbox",
  "Live updates",
  "Department filters",
] as const;

/**
 * Infinite capability strip — same energy as remote.com’s customer logo marquee.
 */
export function MarketingMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      className="marketing-marquee relative overflow-hidden border-y border-norma-border/70 bg-norma-surface/60 py-5 backdrop-blur-md"
      aria-label="Product surfaces"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-norma-canvas to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-norma-canvas to-transparent md:w-24" />
      <div className="marketing-marquee-track flex w-max gap-10 whitespace-nowrap px-6">
        {row.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex items-center gap-3 font-[family-name:var(--font-norma-display)] text-lg tracking-tight text-norma-ink md:text-xl"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-norma-ink/40" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
