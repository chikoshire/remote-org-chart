import Image from "next/image";
import Link from "next/link";
import { AcmeLogo } from "@/components/brand/AcmeLogo";

/**
 * remote.com hero pattern: left copy + right product visual with floating chips.
 */
export function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 85% 20%, rgb(217 235 248 / 0.75) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 10% 0%, rgb(232 224 245 / 0.55) 0%, transparent 50%), radial-gradient(ellipse 40% 35% at 60% 80%, rgb(216 240 230 / 0.45) 0%, transparent 50%)",
        }}
      />
      <div className="marketing-grain pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-12 md:gap-10 md:px-8 md:pb-28 md:pt-24">
        <div className="marketing-hero-copy md:col-span-5">
          <AcmeLogo
            withWordmark
            className="origin-left scale-[1.15]"
            markClassName="!h-10 !w-10"
          />
          <h1 className="marketing-hero-title mt-10 font-[family-name:var(--font-norma-display)] text-[clamp(2.85rem,6vw,4.25rem)] leading-[1.02] tracking-tight text-norma-ink">
            See how Acme is organised
          </h1>
          <p className="marketing-hero-copy mt-6 max-w-md text-lg leading-relaxed text-norma-ink-muted md:text-xl md:leading-relaxed">
            Reporting lines, people, and data health in one place. Built on
            Remote so the chart stays close to live employment data.
          </p>
          <div className="marketing-hero-cta mt-11 flex flex-wrap items-center gap-4">
            <Link href="/login" className="norma-cta min-h-12 px-8 text-base">
              Log in to the app
            </Link>
            <a
              href="#product"
              className="inline-flex min-h-12 items-center rounded-full border border-norma-ink/20 bg-white/80 px-7 text-base font-medium text-norma-ink transition hover:border-norma-ink/40"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="marketing-hero-visual relative md:col-span-7">
          <div className="relative">
            <div className="overflow-hidden rounded-[1.75rem] border border-norma-border/70 bg-white shadow-[0_32px_90px_rgb(18_18_18/0.14)] ring-1 ring-white/80">
              <Image
                src="/marketing/hero-org-chart.png"
                alt="Acme org chart workspace with Chart, Tree, and Map views"
                width={1600}
                height={1000}
                priority
                className="h-auto w-full object-cover object-top"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </div>

            <div className="marketing-float-chip marketing-float-chip-a absolute -left-3 top-[18%] hidden max-w-[13rem] rounded-2xl border border-norma-peach/80 bg-norma-peach/95 px-4 py-3 shadow-norma-md backdrop-blur sm:block md:-left-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
                Sync
              </p>
              <p className="mt-1 text-sm font-semibold text-norma-ink">
                Remote employments
              </p>
              <p className="text-xs text-norma-success">Live · 149 people</p>
            </div>

            <div className="marketing-float-chip marketing-float-chip-b absolute -right-2 top-[42%] hidden max-w-[12.5rem] rounded-2xl border border-norma-sky/80 bg-norma-sky/95 px-4 py-3 shadow-norma-md backdrop-blur md:block md:-right-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
                Data health
              </p>
              <p className="mt-1 text-sm font-semibold text-norma-ink">
                Completeness
              </p>
              <p className="text-xs text-norma-ink-muted">Title · dept · country</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
