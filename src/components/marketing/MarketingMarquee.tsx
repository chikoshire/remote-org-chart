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
 * Trust / capability strip under the hero - remote.com logo-marquee structure.
 */
export function MarketingMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="border-y border-norma-border/70 bg-norma-surface/70 py-8 backdrop-blur-md">
      <p className="text-center font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.22em] text-norma-ink-muted">
        Organisational intelligence on Remote
      </p>
      <div
        className="marketing-marquee relative mt-5 overflow-hidden"
        aria-label="Product surfaces"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-norma-surface to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-norma-surface to-transparent md:w-24" />
        <div className="marketing-marquee-track flex w-max gap-10 whitespace-nowrap px-6">
          {row.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="inline-flex items-center gap-3 font-[family-name:var(--font-norma-display)] text-lg tracking-tight text-norma-ink md:text-xl"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-norma-ink/40"
                aria-hidden
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
