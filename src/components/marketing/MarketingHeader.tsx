"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { AcmeLogo } from "@/components/brand/AcmeLogo";

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#surfaces", label: "Surfaces" },
  { href: "#source", label: "Integrations" },
] as const;

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={`marketing-header sticky top-0 z-30 transition-[background,box-shadow,border-color] duration-300 ${
        scrolled || menuOpen
          ? "border-b border-norma-border/80 bg-norma-canvas/80 shadow-norma-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 md:px-8 md:py-6">
        <a href="#top" className="min-w-0 shrink-0 transition hover:opacity-80" id="top">
          <AcmeLogo withWordmark className="origin-left scale-95 md:scale-100" />
        </a>
        <nav aria-label="Marketing" className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-base font-medium text-norma-ink-muted transition hover:text-norma-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-norma-border/80 bg-white/70 text-norma-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
          <Link href="/login" className="norma-cta min-h-11 px-5 text-sm sm:px-6 sm:text-base">
            Log in
          </Link>
        </div>
      </div>
      {menuOpen ? (
        <nav
          id={menuId}
          aria-label="Marketing mobile"
          className="border-t border-norma-border/70 px-5 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-norma-md px-3 py-3 text-base font-medium text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
