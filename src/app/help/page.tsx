"use client";

import Link from "next/link";
import { ProductShell } from "@/components/shell/ProductShell";
import { ProductPageFrame } from "@/components/shell/ProductPageFrame";
import { listHelpPages } from "@/lib/help/load-help";
import { requestProductTour } from "@/lib/tour/storage";

export default function HelpIndexPage() {
  const pages = listHelpPages();

  return (
    <ProductShell status={<span>Help</span>}>
      <ProductPageFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-ink md:text-3xl">
              Help
            </h1>
            <p className="mt-2 text-sm text-norma-ink-muted">
              Short how-tos with annotated screenshots for each product surface.
              Use the assistant (bottom right) for quick questions, or open a
              page below.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-norma-md border border-norma-border bg-norma-surface px-3.5 py-2 text-xs font-semibold text-norma-ink shadow-norma-sm hover:bg-norma-surface-muted"
            onClick={() => requestProductTour()}
          >
            Take the product tour
          </button>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/help/${page.slug}`}
                className="block rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm transition hover:-translate-y-0.5 hover:shadow-norma-md"
              >
                <span className="text-base font-semibold text-norma-prussian">
                  {page.title}
                </span>
                <span className="mt-1 block text-xs text-norma-ink-subtle">
                  /help/{page.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </ProductPageFrame>
    </ProductShell>
  );
}
