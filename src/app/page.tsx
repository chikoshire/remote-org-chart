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
import { OrgChartPrefetch } from "@/components/marketing/OrgChartPrefetch";
import { sharePreviewMetadata } from "@/lib/seo/share-preview";

export const metadata: Metadata = sharePreviewMetadata({
  title: "Acme · People intelligence",
  description:
    "Explore Acme’s reporting lines, people, and data health in one standalone workspace.",
  path: "/",
  imagePath: "/marketing/hero-org-chart.png",
});


const SURFACES = [
  {
    name: "Chart",
    line: "Interactive reporting lines with pan, zoom, and compare.",
    src: "/marketing/hero-org-chart.png",
    alt: "Acme org chart workspace",
    accent: "from-norma-peach/50 via-white to-white",
    chip: "bg-norma-peach",
  },
  {
    name: "Tree",
    line: "Expand and collapse the hierarchy without losing context.",
    src: "/marketing/app-tree.png",
    alt: "Acme reporting tree",
    accent: "from-norma-lavender/55 via-white to-white",
    chip: "bg-norma-lavender",
  },
  {
    name: "Map",
    line: "See where people sit by country. Live counts come from Remote, not a fixed marketing number.",
    src: "/marketing/app-map.png",
    alt: "Acme world map",
    accent: "from-norma-sky/55 via-white to-white",
    chip: "bg-norma-sky",
  },
  {
    name: "People",
    line: "Search the directory, open profiles, spot incomplete data.",
    src: "/marketing/app-people.png",
    alt: "Acme people directory",
    accent: "from-norma-mint/55 via-white to-white",
    chip: "bg-norma-mint",
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
      <OrgChartPrefetch />
      <MarketingHeader />

      <main className="relative z-10 flex-1">
        <MarketingHero />

        <MarketingMarquee />

        <section
          id="product"
          className="scroll-mt-24 border-t border-norma-border/60 bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
            <MarketingReveal>
              <p className="font-[family-name:var(--font-norma-mono)] text-xs font-medium uppercase tracking-[0.2em] text-[#c43c3c]">
                How we do it
              </p>
              <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-norma-display)] text-4xl tracking-tight text-norma-ink md:text-[3.15rem] md:leading-[1.08]">
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
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
            <MarketingReveal>
              <p className="font-[family-name:var(--font-norma-mono)] text-xs uppercase tracking-[0.2em] text-norma-ink-muted">
                Surfaces
              </p>
              <h2 className="mt-5 max-w-xl font-[family-name:var(--font-norma-display)] text-4xl tracking-tight text-norma-ink md:text-[3.15rem] md:leading-[1.08]">
                Four ways into the same company
              </h2>
            </MarketingReveal>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              {SURFACES.map((surface, index) => (
                <MarketingReveal key={surface.name} delayMs={index * 80}>
                  <Link
                    href="/login"
                    className={`marketing-surface-panel group block overflow-hidden rounded-[1.75rem] border border-norma-border/70 bg-gradient-to-b ${surface.accent} shadow-norma-sm`}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-norma-surface-muted">
                      <Image
                        src={surface.src}
                        alt={surface.alt}
                        width={1600}
                        height={900}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-7 md:p-8">
                      <span
                        className={`mb-4 inline-flex h-3 w-3 rounded-full ${surface.chip}`}
                        aria-hidden
                      />
                      <p className="font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-norma-ink md:text-[2.15rem]">
                        {surface.name}
                      </p>
                      <p className="mt-3 text-base leading-relaxed text-norma-ink-muted md:text-lg">
                        {surface.line}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-norma-ink">
                        Try now
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
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-5 py-24 md:flex-row md:items-end md:justify-between md:px-8 md:py-32">
            <MarketingReveal className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-norma-border/80 bg-white/80 px-4 py-2 shadow-norma-sm backdrop-blur">
                <RemoteMark className="h-5 w-auto" />
                <span className="text-sm font-medium text-norma-ink-muted">
                  Remote integration
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-norma-display)] text-4xl tracking-tight text-norma-ink md:text-[3.15rem] md:leading-[1.08]">
                Acme product. HRIS connected.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-norma-ink-muted md:text-xl">
                Acme Org Chart is a standalone organisational intelligence app.
                It integrates with Remote for employments and reporting lines,
                then turns that graph into chart, tree, map, and people views.
              </p>
            </MarketingReveal>
            <MarketingReveal delayMs={120}>
              <Link
                href="/login"
                className="norma-cta min-h-12 shrink-0 px-9 text-base"
              >
                Try now
              </Link>
            </MarketingReveal>
          </div>
        </section>

        <section className="border-t border-norma-border/60 bg-white py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
            <MarketingReveal>
              <h2 className="font-[family-name:var(--font-norma-display)] text-4xl tracking-tight text-norma-ink md:text-5xl">
                Ready to explore Acme?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-norma-ink-muted">
                Open Chart, Tree, Map, and People in one workspace. Live org
                structure, connected through your HRIS integration.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/login" className="norma-cta min-h-12 px-9 text-base">
                  Try now
                </Link>
                <a
                  href="#product"
                  className="inline-flex min-h-12 items-center rounded-full border border-norma-border px-7 text-base font-medium text-norma-ink transition hover:border-norma-ink/30"
                >
                  See how it works
                </a>
              </div>
            </MarketingReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-norma-border/80 bg-norma-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-12 text-base text-norma-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
          <AcmeLogo withWordmark className="opacity-90" />
          <div className="flex flex-wrap gap-6">
            <a href="#product" className="transition hover:text-norma-ink">
              Product
            </a>
            <a href="#surfaces" className="transition hover:text-norma-ink">
              Surfaces
            </a>
            <a href="#source" className="transition hover:text-norma-ink">
              Integrations
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
