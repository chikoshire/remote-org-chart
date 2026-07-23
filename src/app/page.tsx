export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-8 py-12 md:px-12">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[var(--norma-text-xs)] uppercase tracking-[var(--norma-tracking-label)] text-norma-royal">
          Remote · Acme Sandbox Corp
        </p>
        <h1 className="font-[family-name:var(--font-norma-display)] text-[length:var(--norma-text-3xl)] leading-[var(--norma-leading-tight)] text-norma-prussian">
          Org chart
        </h1>
        <p className="max-w-xl text-[length:var(--norma-text-lg)] leading-[var(--norma-leading-snug)] text-norma-ink-muted">
          Norma tokens are live. Royal, Prussian, and Spray drive the product
          chrome for the chart UI next.
        </p>
      </header>

      <section
        aria-label="Norma token swatches"
        className="grid max-w-3xl gap-4 sm:grid-cols-3"
      >
        <Swatch name="Royal Blue" hex="#624DE3" className="bg-norma-royal" />
        <Swatch
          name="Prussian Blue"
          hex="#00234B"
          className="bg-norma-prussian"
        />
        <Swatch name="Spray" hex="#75E8F0" className="bg-norma-spray" ink />
      </section>
    </main>
  );
}

function Swatch({
  name,
  hex,
  className,
  ink = false,
}: {
  name: string;
  hex: string;
  className: string;
  ink?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-norma-md border border-norma-border bg-norma-surface shadow-norma-sm">
      <div className={`h-24 ${className}`} />
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <span
          className={`text-sm font-medium ${ink ? "text-norma-prussian" : "text-norma-ink"}`}
        >
          {name}
        </span>
        <span className="font-mono text-xs text-norma-ink-subtle">{hex}</span>
      </div>
    </div>
  );
}
