import type { Metadata } from "next";
import Link from "next/link";
import { ProductShell } from "@/components/shell/ProductShell";

export const metadata: Metadata = {
  title: "Acme Org Chart · Welcome",
  description:
    "Interactive organization chart for Acme Sandbox Corp — powered by the Remote sandbox HRIS API.",
};

/**
 * Product marketing surface (GH#33). Chart lives at `/app`; `/` redirects there.
 */
export default function WelcomePage() {
  return (
    <ProductShell status={<span>Welcome · Remote sandbox assessment</span>}>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-auto bg-[#0b2a32] text-[#f4f7f5]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 20% 10%, #e85d04 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, #1a6b7a 0%, transparent 50%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgb(255 255 255 / 0.02) 2px, rgb(255 255 255 / 0.02) 3px)",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-12 md:px-10 md:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#e85d04]">
              Sandbox Corp · Remote HRIS
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-norma-display)] text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.05] tracking-tight text-[#f4f7f5]">
              Organization chart
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#c5d5d8] md:text-lg">
              See who reports to whom across the company — live from Remote,
              built for interview demos and headless HRIS workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-[#0b2a32] transition hover:bg-[#ff7a2f]"
              >
                Open organization chart
              </Link>
              <a
                href="https://github.com/chikoshire/remote-org-chart"
                className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium text-[#9fd5de] underline-offset-4 hover:underline"
              >
                Source on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
