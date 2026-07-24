"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ProductShellProps = {
  children: ReactNode;
  status?: ReactNode;
};

const navLinkClass = (active: boolean) =>
  `rounded-norma-sm px-3 py-1.5 text-sm font-medium transition ${
    active
      ? "bg-white/15 text-[#f4f7f5]"
      : "text-[#9fd5de] hover:bg-white/10 hover:text-[#f4f7f5]"
  }`;

export function ProductShell({ children, status }: ProductShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col bg-norma-canvas">
      <a href="#org-chart" className="skip-link">
        Skip to organization chart
      </a>
      <header
        role="banner"
        className="relative flex h-14 shrink-0 items-center gap-4 overflow-hidden border-b border-white/10 bg-[#0b2a32] px-4 text-[#f4f7f5] md:px-6"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 120% at 0% 50%, #e85d04 0%, transparent 55%), radial-gradient(ellipse 40% 100% at 100% 0%, #2a9d8f 0%, transparent 45%)",
          }}
        />
        <Link
          href="/app"
          className="relative z-10 flex min-w-0 items-center gap-2.5"
        >
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-norma-sm bg-[#e85d04] font-[family-name:var(--font-norma-display)] text-sm font-bold text-[#0b2a32]"
          >
            A
          </span>
          <span className="truncate font-[family-name:var(--font-norma-display)] text-base font-semibold tracking-tight">
            Acme
          </span>
        </Link>
        <nav
          className="relative z-10 ml-2 flex min-w-0 items-center gap-1"
          aria-label="Primary"
        >
          <Link
            href="/app"
            className={navLinkClass(
              pathname === "/app" || pathname === "/",
            )}
            aria-current={
              pathname === "/app" || pathname === "/" ? "page" : undefined
            }
          >
            Org
          </Link>
          <Link
            href="/welcome"
            className={navLinkClass(pathname === "/welcome")}
            aria-current={pathname === "/welcome" ? "page" : undefined}
          >
            Welcome
          </Link>
          <Link
            href="/settings"
            className={navLinkClass(pathname === "/settings")}
            aria-current={pathname === "/settings" ? "page" : undefined}
          >
            Settings
          </Link>
        </nav>
      </header>
      <main
        id="main-content"
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {children}
      </main>
      <footer
        role="contentinfo"
        className="flex h-8 shrink-0 items-center border-t border-norma-border bg-norma-surface-muted px-4 text-[11px] text-norma-ink-muted md:px-6"
      >
        {status ?? <span>Remote sandbox · read-only</span>}
      </footer>
    </div>
  );
}
