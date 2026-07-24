"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AcmeLogo } from "@/components/brand/AcmeLogo";

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#surfaces", label: "Surfaces" },
  { href: "#source", label: "Source" },
] as const;

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`marketing-header sticky top-0 z-30 transition-[background,box-shadow,border-color] duration-300 ${
        scrolled
          ? "border-b border-norma-border/80 bg-norma-canvas/80 shadow-norma-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
        <a href="#top" className="shrink-0 transition hover:opacity-80" id="top">
          <AcmeLogo withWordmark />
        </a>
        <nav aria-label="Marketing" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-norma-ink-muted transition hover:text-norma-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/chikoshire/remote-org-chart"
            className="hidden text-sm font-medium text-norma-ink-muted transition hover:text-norma-ink sm:inline"
          >
            GitHub
          </a>
          <Link href="/login" className="norma-cta min-h-10 px-5 text-sm">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
