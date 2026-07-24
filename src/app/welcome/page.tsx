import type { Metadata } from "next";
import Link from "next/link";
import { AcmeLogo } from "@/components/brand/AcmeLogo";

export const metadata: Metadata = {
  title: "Acme Org Chart · Welcome",
  description:
    "Interactive organization chart for Acme — powered by Remote.",
};

/**
 * Bonus marketing landing (GH#33). Not primary nav — linked from README / Settings.
 */
export default function WelcomePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#f7f5f0] text-[#1a1a1a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 15% 10%, rgb(232 93 4 / 0.28) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 90% 85%, rgb(11 42 50 / 0.2) 0%, transparent 50%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <AcmeLogo />
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="text-sm font-medium text-[#4a646c] underline-offset-4 hover:underline"
          >
            Settings
          </Link>
          <Link
            href="/app"
            className="text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
          >
            Open chart
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-16 pt-8 md:px-10 md:pb-24">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#e85d04]">
            People powered · Remote
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-norma-display)] text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.05] tracking-tight text-[#1a1a1a]">
            Organization chart
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#4a646c] md:text-lg">
            See who reports to whom across Acme — live from Remote.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#ff7a2f]"
            >
              Open organization chart
            </Link>
            <a
              href="https://github.com/chikoshire/remote-org-chart"
              className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium text-[#4a646c] underline-offset-4 hover:underline"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
