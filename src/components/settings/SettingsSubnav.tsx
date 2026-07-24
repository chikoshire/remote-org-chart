"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/settings",
    label: "Preferences",
    match: (p: string) => p === "/settings",
  },
  {
    href: "/settings/data-health",
    label: "Data Health",
    match: (p: string) => p.startsWith("/settings/data-health"),
  },
] as const;

export function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-1 rounded-norma-lg border border-norma-border bg-white/80 p-1 shadow-norma-sm"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-norma-md px-3.5 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#e85d04] text-norma-prussian shadow-norma-sm"
                : "text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
