import type { Metadata } from "next";
import Link from "next/link";
import { AcmeLogo } from "@/components/brand/AcmeLogo";
import { MarketingProductMock } from "@/components/marketing/MarketingProductMock";

export const metadata: Metadata = {
  title: "Acme · People intelligence",
  description:
    "Explore Acme’s reporting lines, people, and data health in one place — powered by Remote.",
};

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#surfaces", label: "Surfaces" },
  { href: "#source", label: "Source of truth" },
] as const;

const SURFACES = [
  {
    name: "Chart",
    line: "Interactive reporting lines with pan, zoom, and compare.",
    tint: "bg-norma-lavender",
  },
  {
    name: "Tree",
    line: "Expand and collapse the hierarchy without losing context.",
    tint: "bg-norma-mint",
  },
  {
    name: "Map",
    line: "See where people sit geographically — country by country.",
    tint: "bg-norma-sky",
  },
  {
    name: "People",
    line: "Search the directory, open profiles, spot incomplete data.",
    tint: "bg-norma-peach",
  },
] as const;

const BEATS = [
  {
    kicker: "01",
    title: "One hierarchy, many lenses",
    body: "Switch between chart, tree, and map without leaving the org. Each view is the same employment graph — different questions.",
  },
  {
    kicker: "02",
    title: "People stay attached to context",
    body: "Open someone from search or the chart and keep the canvas in view. Profiles dock beside the work instead of covering it.",
  },
  {
    kicker: "03",
    title: "Data health is visible",
    body: "Missing managers and thin records surface on the dashboard and in People — so the chart is honest about what Remote knows.",
  },
] as const;

export default function MarketingHomePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-norma-canvas text-norma-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 85% 20%, rgb(232 224 245 / 0.65) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 5% 0%, rgb(255 232 204 / 0.5) 0%, transparent 50%)",
        }}
      />

      <header className="norma-glass relative z-20 border-b border-norma-border/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="#top" className="shrink-0" id="top">
            <AcmeLogo withWordmark />
          </a>
          <nav
            aria-label="Marketing"
            className="hidden items-center gap-7 md:flex"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-norma-ink-muted transition hover:text-norma-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Link href="/login" className="norma-cta min-h-10 px-5 text-sm">
            Log in
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-0 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pt-16 lg:pt-20">
          <div className="marketing-hero-copy flex flex-col justify-center md:col-span-5 md:pb-16">
            <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.22em] text-norma-ink-muted">
              Acme · People intelligence
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-norma-display)] text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-norma-ink">
              See how Acme is organised
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-norma-ink-muted md:text-lg">
              Explore reporting lines, people, and data health in one place —
              built on Remote so the chart stays close to the source of truth.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="norma-cta min-h-11 px-6 text-sm">
                Log in to the app
              </Link>
              <a
                href="https://github.com/chikoshire/remote-org-chart"
                className="text-sm font-medium text-norma-ink-muted underline-offset-4 transition hover:text-norma-ink hover:underline"
              >
                Source on GitHub
              </a>
            </div>
          </div>

          <div className="marketing-hero-visual relative md:col-span-7 md:-mr-8 lg:-mr-[max(0px,calc((100vw-72rem)/2+2rem))]">
            <div className="h-[min(70vh,32rem)] w-full overflow-hidden rounded-tl-norma-lg border border-norma-border/60 border-b-0 border-r-0 shadow-norma-md md:h-[min(75vh,36rem)]">
              <MarketingProductMock />
            </div>
          </div>
        </section>

        <section
          id="product"
          className="scroll-mt-20 border-t border-norma-border/80 bg-norma-surface/50"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-norma-ink-muted">
              Product
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-4xl">
              Organisational intelligence without another spreadsheet
            </h2>
            <ul className="mt-12 divide-y divide-norma-border border-y border-norma-border">
              {BEATS.map((beat) => (
                <li
                  key={beat.kicker}
                  className="grid gap-3 py-8 md:grid-cols-[5rem_1fr_1.2fr] md:gap-8 md:py-10"
                >
                  <span className="font-[family-name:var(--font-norma-mono)] text-sm text-norma-ink-subtle">
                    {beat.kicker}
                  </span>
                  <h3 className="font-[family-name:var(--font-norma-display)] text-xl text-norma-ink md:text-2xl">
                    {beat.title}
                  </h3>
                  <p className="text-base leading-relaxed text-norma-ink-muted">
                    {beat.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="surfaces" className="scroll-mt-20 border-t border-norma-border/80">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-norma-ink-muted">
              Surfaces
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-4xl">
              Four ways into the same company
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SURFACES.map((surface) => (
                <div
                  key={surface.name}
                  className={`rounded-norma-lg border border-norma-border/60 p-5 shadow-norma-sm ${surface.tint}`}
                >
                  <p className="font-[family-name:var(--font-norma-display)] text-2xl text-norma-ink">
                    {surface.name}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-norma-ink-muted">
                    {surface.line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="source"
          className="scroll-mt-20 border-t border-norma-border/80 bg-norma-lavender/40"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-24">
            <div className="max-w-xl">
              <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-norma-ink-muted">
                Source of truth
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-4xl">
                Built on Remote, not a shadow HRIS
              </h2>
              <p className="mt-4 text-base leading-relaxed text-norma-ink-muted">
                Employments and managers come from the Remote sandbox API. The
                app shapes that graph into chart, tree, map, and people —
                without inventing a second employee database.
              </p>
            </div>
            <Link href="/login" className="norma-cta min-h-11 shrink-0 px-6 text-sm">
              Open the workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="norma-glass relative z-10 border-t border-norma-border/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-norma-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
          <AcmeLogo withWordmark className="opacity-90" />
          <div className="flex flex-wrap gap-5">
            <a
              href="https://github.com/chikoshire/remote-org-chart"
              className="hover:text-norma-ink"
            >
              GitHub
            </a>
            <a
              href="https://developer.remote.com"
              className="hover:text-norma-ink"
            >
              Remote developers
            </a>
            <Link href="/login" className="hover:text-norma-ink">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
