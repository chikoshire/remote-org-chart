import type { Metadata } from "next";
import Link from "next/link";
import { AcmeLogo } from "@/components/brand/AcmeLogo";
import { MarketingAtmosphere } from "@/components/marketing/MarketingAtmosphere";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingMarquee } from "@/components/marketing/MarketingMarquee";
import { MarketingProductMock } from "@/components/marketing/MarketingProductMock";
import { MarketingReveal } from "@/components/marketing/MarketingReveal";
import { RemoteMark } from "@/components/brand/RemoteMark";

export const metadata: Metadata = {
  title: "Acme · People intelligence",
  description:
    "Explore Acme’s reporting lines, people, and data health in one place — powered by Remote.",
};

const SURFACES = [
  {
    name: "Chart",
    line: "Interactive reporting lines with pan, zoom, and compare.",
    tint: "from-norma-lavender via-norma-lavender/70 to-white",
  },
  {
    name: "Tree",
    line: "Expand and collapse the hierarchy without losing context.",
    tint: "from-norma-mint via-norma-mint/70 to-white",
  },
  {
    name: "Map",
    line: "See where people sit geographically — country by country.",
    tint: "from-norma-sky via-norma-sky/70 to-white",
  },
  {
    name: "People",
    line: "Search the directory, open profiles, spot incomplete data.",
    tint: "from-norma-peach via-norma-peach/70 to-white",
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
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-norma-canvas text-norma-ink">
      <MarketingHeader />

      <main className="relative z-10 flex-1">
        {/* Hero — remote.com-style: copy first, full-bleed product visual */}
        <section className="relative">
          <MarketingAtmosphere variant="top" />

          <div className="relative mx-auto max-w-4xl px-5 pb-12 pt-16 text-center md:px-8 md:pb-16 md:pt-24">
            <div className="marketing-hero-brand mx-auto flex justify-center">
              <AcmeLogo
                withWordmark
                className="origin-center scale-[1.55] md:scale-[1.75]"
                markClassName="!h-10 !w-10 md:!h-12 md:!w-12"
              />
            </div>
            <h1 className="marketing-hero-title mt-12 font-[family-name:var(--font-norma-display)] text-[clamp(2.75rem,7.5vw,4.5rem)] leading-[1.02] tracking-tight text-norma-ink">
              See how Acme is organised
            </h1>
            <p className="marketing-hero-copy mx-auto mt-6 max-w-xl text-base leading-relaxed text-norma-ink-muted md:text-lg">
              Explore reporting lines, people, and data health in one place —
              built on Remote so the chart stays close to the source of truth.
            </p>
            <div className="marketing-hero-cta mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="norma-cta min-h-11 px-7 text-sm">
                Log in to the app
              </Link>
              <a
                href="#product"
                className="inline-flex min-h-11 items-center rounded-full border border-norma-border bg-white/70 px-6 text-sm font-medium text-norma-ink shadow-norma-sm backdrop-blur transition hover:border-norma-ink/25 hover:bg-white"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="marketing-hero-visual relative w-full">
            <div className="mx-auto max-w-[78rem] overflow-hidden rounded-t-[1.75rem] border border-b-0 border-norma-border/70 shadow-[0_40px_100px_rgb(18_18_18/0.14)] ring-1 ring-white/70 md:rounded-t-[2rem]">
              <div className="h-[min(64vh,38rem)] w-full md:h-[min(72vh,44rem)]">
                <MarketingProductMock />
              </div>
            </div>
          </div>
        </section>

        <MarketingMarquee />

        <section
          id="product"
          className="scroll-mt-24 border-t border-norma-border/60 bg-norma-surface/40"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <MarketingReveal>
              <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-norma-ink-muted">
                How we do it
              </p>
              <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.75rem] md:leading-[1.1]">
                One system of record. Every organisational lens.
              </h2>
            </MarketingReveal>

            <ul className="mt-16 divide-y divide-norma-border border-y border-norma-border">
              {BEATS.map((beat, index) => (
                <li key={beat.kicker}>
                  <MarketingReveal delayMs={index * 90}>
                    <div className="marketing-beat-row grid gap-3 py-10 md:grid-cols-[5rem_1fr_1.25fr] md:gap-10 md:py-14">
                      <span className="font-[family-name:var(--font-norma-mono)] text-sm text-norma-ink-muted">
                        {beat.kicker}
                      </span>
                      <h3 className="font-[family-name:var(--font-norma-display)] text-xl text-norma-ink md:text-2xl">
                        {beat.title}
                      </h3>
                      <p className="text-base leading-relaxed text-norma-ink-muted">
                        {beat.body}
                      </p>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="surfaces" className="relative scroll-mt-24 overflow-hidden">
          <MarketingAtmosphere variant="bottom" />
          <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <MarketingReveal>
              <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-norma-ink-muted">
                Surfaces
              </p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.75rem] md:leading-[1.1]">
                Four ways into the same company
              </h2>
            </MarketingReveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {SURFACES.map((surface, index) => (
                <MarketingReveal key={surface.name} delayMs={index * 80}>
                  <Link
                    href="/login"
                    className={`marketing-surface-panel group relative flex min-h-[14rem] flex-col justify-end overflow-hidden rounded-[1.5rem] border border-norma-border/60 bg-gradient-to-br ${surface.tint} p-7 shadow-norma-sm transition`}
                  >
                    <div className="marketing-surface-sheen absolute inset-0" />
                    <p className="relative font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-4xl">
                      {surface.name}
                    </p>
                    <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-norma-ink-muted md:text-base">
                      {surface.line}
                    </p>
                    <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-norma-ink opacity-80 transition group-hover:opacity-100">
                      Open in app
                      <span aria-hidden className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </MarketingReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="source" className="relative scroll-mt-24 overflow-hidden">
          <MarketingAtmosphere variant="band" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
            <MarketingReveal className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-norma-border/80 bg-white/70 px-3 py-1.5 shadow-norma-sm backdrop-blur">
                <RemoteMark className="h-5 w-auto" />
                <span className="text-xs font-medium text-norma-ink-muted">
                  Powered by Remote
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.75rem] md:leading-[1.1]">
                Built on Remote, not a shadow HRIS
              </h2>
              <p className="mt-5 text-base leading-relaxed text-norma-ink-muted md:text-lg">
                Employments and managers come from the Remote sandbox API. The
                app shapes that graph into chart, tree, map, and people —
                without inventing a second employee database.
              </p>
            </MarketingReveal>
            <MarketingReveal delayMs={120}>
              <Link href="/login" className="norma-cta min-h-12 shrink-0 px-8 text-sm">
                Open the workspace
              </Link>
            </MarketingReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-norma-border/80 bg-norma-surface/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-norma-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
          <AcmeLogo withWordmark className="opacity-90" />
          <div className="flex flex-wrap gap-6">
            <a
              href="https://github.com/chikoshire/remote-org-chart"
              className="transition hover:text-norma-ink"
            >
              GitHub
            </a>
            <a
              href="https://developer.remote.com"
              className="transition hover:text-norma-ink"
            >
              Remote developers
            </a>
            <Link href="/login" className="transition hover:text-norma-ink">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
