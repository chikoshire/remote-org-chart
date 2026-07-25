"use client";

const ITEMS = [
  { label: "Org chart", dot: "bg-norma-peach" },
  { label: "Reporting tree", dot: "bg-norma-lavender" },
  { label: "World map", dot: "bg-norma-sky" },
  { label: "People directory", dot: "bg-norma-mint" },
  { label: "Data health", dot: "bg-norma-rose" },
  { label: "HRIS integration", dot: "bg-norma-spray" },
  { label: "Live updates", dot: "bg-norma-peach" },
  { label: "Department filters", dot: "bg-norma-lavender" },
] as const;

/**
 * Capability strip under the hero.
 */
export function MarketingMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="border-y border-norma-border/70 bg-gradient-to-r from-norma-lavender/40 via-norma-surface/80 to-norma-mint/35 py-10 backdrop-blur-md md:py-12">
      <p className="text-center font-[family-name:var(--font-norma-mono)] text-xs uppercase tracking-[0.22em] text-norma-ink-muted">
        Organisational intelligence
      </p>
      <div
        className="marketing-marquee relative mt-7 overflow-hidden"
        aria-label="Product surfaces"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-norma-lavender/40 to-transparent md:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-norma-mint/35 to-transparent md:w-16" />
        <div className="marketing-marquee-track flex w-max gap-12 whitespace-nowrap px-10 md:gap-16 md:px-14">
          {row.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="inline-flex shrink-0 items-center gap-3.5 font-[family-name:var(--font-norma-display)] text-xl tracking-tight text-norma-ink md:text-2xl"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                aria-hidden
              />
              <span className="shrink-0">{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
