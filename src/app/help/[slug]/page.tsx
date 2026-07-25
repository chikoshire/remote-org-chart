"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ProductShell } from "@/components/shell/ProductShell";
import { ProductPageFrame } from "@/components/shell/ProductPageFrame";
import { getHelpPage, listHelpPages } from "@/lib/help/load-help";
import { renderHelpMarkdown } from "@/lib/help/render-markdown";
import { requestProductTour } from "@/lib/tour/storage";

export default function HelpSlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const page = getHelpPage(slug);
  if (!page) notFound();

  const siblings = listHelpPages();

  return (
    <ProductShell status={<span>Help · {page.title}</span>}>
      <ProductPageFrame>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/help"
            className="text-xs font-semibold text-norma-royal hover:underline"
          >
            ← All help topics
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-norma-md border border-norma-border bg-norma-surface px-3 py-1.5 text-xs font-medium text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian"
              onClick={() => requestProductTour()}
            >
              Product tour
            </button>
            <button
              type="button"
              className="rounded-norma-md border border-norma-border bg-norma-surface px-3 py-1.5 text-xs font-medium text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("acme:open-help-chat"));
              }}
            >
              Open assistant
            </button>
          </div>
        </div>
        <article className="mt-6 max-w-4xl">{renderHelpMarkdown(page.markdown)}</article>
        <nav
          aria-label="Other help topics"
          className="mt-10 flex flex-wrap gap-2 border-t border-norma-border/70 pt-6"
        >
          {siblings.map((s) => (
            <Link
              key={s.slug}
              href={`/help/${s.slug}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                s.slug === page.slug
                  ? "bg-norma-ink text-norma-ink-inverse"
                  : "bg-norma-surface-muted text-norma-ink-muted hover:text-norma-ink"
              }`}
            >
              {s.title}
            </Link>
          ))}
        </nav>
      </ProductPageFrame>
    </ProductShell>
  );
}
