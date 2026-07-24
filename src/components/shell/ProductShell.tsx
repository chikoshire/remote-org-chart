"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AcmeLogo } from "@/components/brand/AcmeLogo";

type ProductShellProps = {
  children: ReactNode;
  status?: ReactNode;
};

export function ProductShell({ children, status }: ProductShellProps) {
  const pathname = usePathname();
  const orgActive = pathname === "/app" || pathname === "/";
  const settingsActive = pathname === "/settings";

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-norma-canvas">
      <a href="#org-chart" className="skip-link">
        Skip to organization chart
      </a>
      <header
        role="banner"
        className="flex h-12 shrink-0 items-center gap-6 border-b border-black/20 bg-[#1a1a1a] px-4 text-[#f4f7f5] md:h-14 md:px-6"
      >
        <Link href="/app" className="flex min-w-0 items-center">
          <AcmeLogo inverse withWordmark />
        </Link>
        <nav
          className="flex min-w-0 flex-1 items-center gap-1"
          aria-label="Primary"
        >
          <Link
            href="/app"
            className={`rounded-norma-sm px-3 py-1.5 text-sm font-medium tracking-wide transition ${
              orgActive
                ? "bg-white/10 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
            aria-current={orgActive ? "page" : undefined}
          >
            Org
          </Link>
        </nav>
        <Link
          href="/settings"
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-norma-sm transition ${
            settingsActive
              ? "bg-white/15 text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Settings"
          aria-current={settingsActive ? "page" : undefined}
          title="Settings"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 13a7.7 7.7 0 0 0 .05-2l2.05-1.6-2-3.45-2.45.95a7.6 7.6 0 0 0-1.75-1L15 3h-6l-.3 2.9a7.6 7.6 0 0 0-1.75 1L4.5 5.95l-2 3.45L4.55 11a7.7 7.7 0 0 0 0 2l-2.05 1.6 2 3.45 2.45-.95a7.6 7.6 0 0 0 1.75 1L9 21h6l.3-2.9a7.6 7.6 0 0 0 1.75-1l2.45.95 2-3.45L19.4 13Z" />
          </svg>
        </Link>
      </header>
      <main
        id="main-content"
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 0% 0%, rgb(232 93 4 / 0.18) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 100% 100%, rgb(42 157 143 / 0.16) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </main>
      <footer
        role="contentinfo"
        className="flex h-7 shrink-0 items-center border-t border-norma-border bg-norma-surface px-4 text-[11px] text-norma-ink-muted md:px-6"
      >
        {status ?? <span>Remote sandbox · read-only</span>}
      </footer>
    </div>
  );
}
