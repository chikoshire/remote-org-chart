"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AcmeLogo } from "@/components/brand/AcmeLogo";
import { CommandBar } from "@/components/shell/CommandBar";

type ProductShellProps = {
  children: ReactNode;
  status?: ReactNode;
};

const PRIMARY_NAV = [
  { href: "/app/dashboard", label: "Dashboard", match: (p: string) => p === "/app/dashboard" },
  {
    href: "/app",
    label: "Org Chart",
    match: (p: string) => p === "/app" || p === "/",
  },
  { href: "/app/people", label: "People", match: (p: string) => p.startsWith("/app/people") },
] as const;

function navClass(active: boolean) {
  return `whitespace-nowrap rounded-norma-sm px-2.5 py-1.5 text-sm font-medium transition md:px-3 ${
    active
      ? "bg-norma-accent-soft text-norma-prussian"
      : "text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
  }`;
}

export function ProductShellInner({ children, status }: ProductShellProps) {
  const pathname = usePathname();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-norma-canvas">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header
        role="banner"
        className="flex h-12 shrink-0 items-center gap-3 border-b border-norma-border bg-norma-surface px-3 text-norma-prussian md:h-14 md:gap-6 md:px-6"
      >
        <Link href="/app/dashboard" className="flex min-w-0 shrink-0 items-center">
          <AcmeLogo withWordmark />
        </Link>
        <nav
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:gap-1"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <CommandBar />
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-norma-sm px-2.5 py-1.5 text-sm font-medium text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
          >
            Log out
          </button>
          <Link
            href="/settings"
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-norma-sm transition ${
              settingsActive
                ? "bg-norma-accent-soft text-norma-prussian"
                : "text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
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
        </div>
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
              "radial-gradient(ellipse 70% 50% at 0% 0%, rgb(232 93 4 / 0.14) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 100% 100%, rgb(42 157 143 / 0.12) 0%, transparent 50%)",
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
        {status ?? <span>Acme · Connected to Remote</span>}
      </footer>
    </div>
  );
}
