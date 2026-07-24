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

/**
 * Settings secondary nav - always rendered in the sticky strip under the
 * primary header (same position on Preferences and Data Health).
 */
export function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="norma-glass flex flex-wrap gap-1 rounded-full border border-norma-border/80 p-1 shadow-norma-sm"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-norma-ink text-norma-ink-inverse shadow-norma-sm"
                : "text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
