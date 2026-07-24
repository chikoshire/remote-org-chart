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
  },
  {
    name: "Tree",
    line: "Expand and collapse the hierarchy without losing context.",
  },
  {
    name: "Map",
    line: "See where people sit geographically — country by country.",
  },
  {
    name: "People",
    line: "Search the directory, open profiles, spot incomplete data.",
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
    <div className="relative flex min-h-[100dvh] flex-col bg-[#e8eef0] text-[#0b2a32]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 85% 20%, rgb(117 232 240 / 0.22) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 5% 0%, rgb(232 93 4 / 0.16) 0%, transparent 50%)",
        }}
      />

      <header className="relative z-20 border-b border-[#0b2a32]/08 bg-[#e8eef0]/80 backdrop-blur-md">
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
                className="text-sm font-medium text-[#3d5a63] transition hover:text-[#0b2a32]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#e85d04] px-4 text-sm font-semibold text-white transition hover:bg-[#ff7a2f]"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero: brand + copy + dominant product visual */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-0 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pt-16 lg:pt-20">
          <div className="marketing-hero-copy flex flex-col justify-center md:col-span-5 md:pb-16">
            <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.22em] text-[#e85d04]">
              Acme · People intelligence
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-norma-display)] text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-[#00234b]">
              See how Acme is organised
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#3d5a63] md:text-lg">
              Explore reporting lines, people, and data health in one place —
              built on Remote so the chart stays close to the source of truth.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-white transition hover:bg-[#ff7a2f]"
              >
                Log in to the app
              </Link>
              <a
                href="https://github.com/chikoshire/remote-org-chart"
                className="text-sm font-medium text-[#3d5a63] underline-offset-4 transition hover:text-[#0b2a32] hover:underline"
              >
                Source on GitHub
              </a>
            </div>
          </div>

          <div className="marketing-hero-visual relative md:col-span-7 md:-mr-8 lg:-mr-[max(0px,calc((100vw-72rem)/2+2rem))]">
            <div className="h-[min(70vh,32rem)] w-full overflow-hidden rounded-tl-2xl border border-[#0b2a32]/10 border-b-0 border-r-0 md:h-[min(75vh,36rem)] md:rounded-tl-3xl">
              <MarketingProductMock />
            </div>
          </div>
        </section>

        {/* Editorial beats */}
        <section
          id="product"
          className="scroll-mt-20 border-t border-[#0b2a32]/10 bg-[#f4f8f9]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-[#e85d04]">
              Product
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-[#00234b] md:text-4xl">
              Organisational intelligence without another spreadsheet
            </h2>
            <ul className="mt-12 divide-y divide-[#0b2a32]/10 border-y border-[#0b2a32]/10">
              {BEATS.map((beat) => (
                <li
                  key={beat.kicker}
                  className="grid gap-3 py-8 md:grid-cols-[5rem_1fr_1.2fr] md:gap-8 md:py-10"
                >
                  <span className="font-[family-name:var(--font-norma-mono)] text-sm text-[#75a8b0]">
                    {beat.kicker}
                  </span>
                  <h3 className="font-[family-name:var(--font-norma-display)] text-xl text-[#00234b] md:text-2xl">
                    {beat.title}
                  </h3>
                  <p className="text-base leading-relaxed text-[#3d5a63]">
                    {beat.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Surfaces */}
        <section
          id="surfaces"
          className="scroll-mt-20 border-t border-[#0b2a32]/10 bg-[#0b2a32] text-[#f4f7f5]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-[#75e8f0]">
              Surfaces
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-norma-display)] text-3xl tracking-tight md:text-4xl">
              Four ways into the same company
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {SURFACES.map((surface) => (
                <div key={surface.name}>
                  <p className="font-[family-name:var(--font-norma-display)] text-2xl text-[#75e8f0]">
                    {surface.name}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    {surface.line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Source of truth */}
        <section
          id="source"
          className="scroll-mt-20 border-t border-[#0b2a32]/10 bg-[#e8eef0]"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-24">
            <div className="max-w-xl">
              <p className="font-[family-name:var(--font-norma-mono)] text-[11px] uppercase tracking-[0.2em] text-[#e85d04]">
                Source of truth
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-norma-display)] text-3xl tracking-tight text-[#00234b] md:text-4xl">
                Built on Remote, not a shadow HRIS
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#3d5a63]">
                Employments and managers come from the Remote sandbox API. The
                app shapes that graph into chart, tree, map, and people —
                without inventing a second employee database.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-[#00234b] px-5 text-sm font-semibold text-white transition hover:bg-[#0b3a5c]"
            >
              Open the workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#0b2a32]/10 bg-[#f4f8f9]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[#3d5a63] md:flex-row md:items-center md:justify-between md:px-8">
          <AcmeLogo withWordmark className="opacity-90" />
          <div className="flex flex-wrap gap-5">
            <a
              href="https://github.com/chikoshire/remote-org-chart"
              className="hover:text-[#0b2a32]"
            >
              GitHub
            </a>
            <a
              href="https://developer.remote.com"
              className="hover:text-[#0b2a32]"
            >
              Remote developers
            </a>
            <Link href="/login" className="hover:text-[#0b2a32]">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
