import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AcmeLogo } from "@/components/brand/AcmeLogo";
import { RemoteMark } from "@/components/brand/RemoteMark";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingHowItWorks } from "@/components/marketing/MarketingHowItWorks";
import { MarketingMarquee } from "@/components/marketing/MarketingMarquee";
import { MarketingReveal } from "@/components/marketing/MarketingReveal";

export const metadata: Metadata = {
  title: "Acme · People intelligence",
  description:
    "Explore Acme’s reporting lines, people, and data health in one place. Powered by Remote.",
};

const SURFACES = [
  {
    name: "Chart",
    line: "Interactive reporting lines with pan, zoom, and compare.",
    src: "/marketing/hero-org-chart.png",
    alt: "Acme org chart workspace",
  },
  {
    name: "Tree",
    line: "Expand and collapse the hierarchy without losing context.",
    src: "/marketing/app-tree.png",
    alt: "Acme reporting tree",
  },
  {
    name: "Map",
    line: "See where people sit by country across the company.",
    src: "/marketing/app-map.png",
    alt: "Acme world map",
  },
  {
    name: "People",
    line: "Search the directory, open profiles, spot incomplete data.",
    src: "/marketing/app-people.png",
    alt: "Acme people directory",
  },
] as const;

/**
 * Marketing home structured like remote.com (hero split, marquee,
 * how-we-do-it accordion + product panel, surface cards, closing CTA),
 * with real Acme product screenshots instead of invented mocks.
 */
export default function MarketingHomePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-norma-canvas text-norma-ink">
      <MarketingHeader />

      <main className="relative z-10 flex-1">
        <MarketingHero />

        <MarketingMarquee />

        <section
          id="product"
          className="scroll-mt-24 border-t border-norma-border/60 bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <MarketingReveal>
              <p className="font-[family-name:var(--font-norma-mono)] text-[11px] font-medium uppercase tracking-[0.2em] text-[#c43c3c]">
                How we do it
              </p>
              <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.75rem] md:leading-[1.1]">
                One system of record. Every organisational lens.
              </h2>
            </MarketingReveal>

            <MarketingHowItWorks />
          </div>
        </section>

        <section
          id="surfaces"
          className="scroll-mt-24 border-t border-norma-border/60 bg-norma-canvas"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <MarketingReveal>
              <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-norma-ink-muted">
                Surfaces
              </p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.75rem] md:leading-[1.1]">
                Four ways into the same company
              </h2>
            </MarketingReveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {SURFACES.map((surface, index) => (
                <MarketingReveal key={surface.name} delayMs={index * 80}>
                  <Link
                    href="/login"
                    className="marketing-surface-panel group block overflow-hidden rounded-[1.5rem] border border-norma-border/70 bg-white shadow-norma-sm"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-norma-surface-muted">
                      <Image
                        src={surface.src}
                        alt={surface.alt}
                        width={1200}
                        height={750}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-6">
                      <p className="font-[family-name:var(--font-norma-display)] text-2xl tracking-tight text-norma-ink md:text-3xl">
                        {surface.name}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-norma-ink-muted md:text-base">
                        {surface.line}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-norma-ink">
                        Open in app
                        <span
                          aria-hidden
                          className="transition group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                </MarketingReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="source"
          className="relative scroll-mt-24 overflow-hidden border-t border-norma-border/60"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 80% at 10% 50%, rgb(232 224 245 / 0.85) 0%, transparent 55%), radial-gradient(ellipse 70% 70% at 90% 40%, rgb(255 232 204 / 0.7) 0%, transparent 50%)",
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
            <MarketingReveal className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-norma-border/80 bg-white/80 px-3 py-1.5 shadow-norma-sm backdrop-blur">
                <RemoteMark className="h-5 w-auto" />
                <span className="text-xs font-medium text-norma-ink-muted">
                  Powered by Remote
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.75rem] md:leading-[1.1]">
                Built on Remote. No second employee database.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-norma-ink-muted md:text-lg">
                Employments and managers come from the Remote sandbox API. This
                app turns that graph into chart, tree, map, and people views,
                without inventing another source of truth.
              </p>
            </MarketingReveal>
            <MarketingReveal delayMs={120}>
              <Link
                href="/login"
                className="norma-cta min-h-12 shrink-0 px-8 text-sm"
              >
                Open the workspace
              </Link>
            </MarketingReveal>
          </div>
        </section>

        <section className="border-t border-norma-border/60 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
            <MarketingReveal>
              <h2 className="font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-4xl">
                Ready to explore Acme?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-norma-ink-muted">
                Log in with the demo credentials shared for your interview, then
                walk Chart, Tree, Map, and People on live Remote sandbox data.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/login" className="norma-cta min-h-11 px-8 text-sm">
                  Log in
                </Link>
                <a
                  href="https://github.com/chikoshire/remote-org-chart"
                  className="inline-flex min-h-11 items-center rounded-full border border-norma-border px-6 text-sm font-medium text-norma-ink transition hover:border-norma-ink/30"
                >
                  View source
                </a>
              </div>
            </MarketingReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-norma-border/80 bg-norma-surface/80 backdrop-blur-md">
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
