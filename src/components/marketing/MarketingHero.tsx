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

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 md:grid-cols-12 md:gap-8 md:px-8 md:pb-20 md:pt-20">
        <div className="marketing-hero-copy md:col-span-5">
          <AcmeLogo
            withWordmark
            className="origin-left scale-110"
            markClassName="!h-9 !w-9"
          />
          <h1 className="marketing-hero-title mt-8 font-[family-name:var(--font-norma-display)] text-[clamp(2.5rem,5.5vw,3.75rem)] leading-[1.05] tracking-tight text-norma-ink">
            See how Acme is organised
          </h1>
          <p className="marketing-hero-copy mt-5 max-w-md text-base leading-relaxed text-norma-ink-muted md:text-lg">
            Reporting lines, people, and data health in one place. Built on
            Remote so the chart stays close to live employment data.
          </p>
          <div className="marketing-hero-cta mt-9 flex flex-wrap items-center gap-3">
            <Link href="/login" className="norma-cta min-h-11 px-7 text-sm">
              Log in to the app
            </Link>
            <a
              href="#product"
              className="inline-flex min-h-11 items-center rounded-full border border-norma-ink/20 bg-white/80 px-6 text-sm font-medium text-norma-ink transition hover:border-norma-ink/40"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="marketing-hero-visual relative md:col-span-7">
          <div className="relative">
            <div className="overflow-hidden rounded-[1.5rem] border border-norma-border/70 bg-white shadow-[0_32px_90px_rgb(18_18_18/0.14)] ring-1 ring-white/80">
              <Image
                src="/marketing/hero-org-chart.png"
                alt="Acme org chart workspace with Chart, Tree, and Map views"
                width={1600}
                height={900}
                priority
                className="h-auto w-full object-cover object-top"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </div>

            <div className="marketing-float-chip marketing-float-chip-a absolute -left-3 top-[18%] hidden max-w-[11.5rem] rounded-2xl border border-norma-border/80 bg-white/95 px-3 py-2.5 shadow-norma-md backdrop-blur sm:block md:-left-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
                Sync
              </p>
              <p className="mt-0.5 text-[12px] font-semibold text-norma-ink">
                Remote employments
              </p>
              <p className="text-[10px] text-norma-success">Live · 149 people</p>
            </div>

            <div className="marketing-float-chip marketing-float-chip-b absolute -right-2 top-[42%] hidden max-w-[11rem] rounded-2xl border border-norma-border/80 bg-white/95 px-3 py-2.5 shadow-norma-md backdrop-blur md:block md:-right-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
                Data health
              </p>
              <p className="mt-0.5 text-[12px] font-semibold text-norma-ink">
                Completeness
              </p>
              <p className="text-[10px] text-norma-ink-muted">Title · dept · country</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
