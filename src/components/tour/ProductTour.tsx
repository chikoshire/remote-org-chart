"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { PRODUCT_TOUR_STEPS } from "@/lib/tour/steps";
import {
  isProductTourDone,
  markProductTourDone,
  PRODUCT_TOUR_START_EVENT,
} from "@/lib/tour/storage";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const PAD = 8;

function readTargetRect(target: string | undefined): SpotlightRect | null {
  if (!target || typeof document === "undefined") return null;
  const els = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    return {
      top: Math.max(0, r.top - PAD),
      left: Math.max(0, r.left - PAD),
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    };
  }
  return null;
}

function tooltipPlacement(rect: SpotlightRect | null): {
  top: number;
  left: number;
} {
  const margin = 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const cardW = Math.min(320, vw - margin * 2);
  const cardH = 180;

  if (!rect) {
    return {
      top: Math.max(margin, (vh - cardH) / 2),
      left: Math.max(margin, (vw - cardW) / 2),
    };
  }

  const below = rect.top + rect.height + 12;
  const above = rect.top - cardH - 12;
  let top = below + cardH < vh - margin ? below : Math.max(margin, above);
  let left = rect.left + rect.width / 2 - cardW / 2;
  left = Math.min(Math.max(margin, left), vw - cardW - margin);
  top = Math.min(Math.max(margin, top), vh - cardH - margin);
  return { top, left };
}

/**
 * First-login product tour. Completes to localStorage; restart via
 * `acme:start-product-tour` (Help page / chat widget).
 */
export function ProductTour() {
  const titleId = useId();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const step = PRODUCT_TOUR_STEPS[stepIndex] ?? PRODUCT_TOUR_STEPS[0]!;
  const isLast = stepIndex >= PRODUCT_TOUR_STEPS.length - 1;

  const measure = useCallback(() => {
    setRect(readTargetRect(step.target));
  }, [step.target]);

  const finish = useCallback(() => {
    markProductTourDone();
    setActive(false);
    setStepIndex(0);
  }, []);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(PRODUCT_TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(PRODUCT_TOUR_START_EVENT, onStart);
  }, [start]);

  useEffect(() => {
    if (isProductTourDone()) return;
    const timer = window.setTimeout(() => start(), 700);
    return () => window.clearTimeout(timer);
  }, [start]);

  useEffect(() => {
    if (!active) return;
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, measure, stepIndex]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  if (!active) return null;

  const tip = tooltipPlacement(rect);

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-norma-md ring-2 ring-norma-spray shadow-[0_0_0_9999px_rgb(18_18_18_/_0.5)]"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-norma-ink/50" aria-hidden />
      )}
      <div
        className="absolute w-[min(20rem,calc(100vw-2rem))] rounded-norma-lg border border-norma-border bg-norma-surface p-4 shadow-norma-md"
        style={{ top: tip.top, left: tip.left }}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-norma-ink-subtle">
          Tour · {stepIndex + 1} of {PRODUCT_TOUR_STEPS.length}
        </p>
        <h2
          id={titleId}
          className="mt-1 font-[family-name:var(--font-norma-display)] text-lg font-semibold text-norma-ink"
        >
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-norma-ink-muted">
          {step.body}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-ink"
            onClick={finish}
          >
            Skip
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 ? (
              <button
                type="button"
                className="rounded-full border border-norma-border bg-norma-surface px-3 py-1.5 text-xs font-medium text-norma-ink-muted hover:text-norma-ink"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full bg-norma-ink px-3.5 py-1.5 text-xs font-semibold text-norma-ink-inverse"
              onClick={() => {
                if (isLast) finish();
                else setStepIndex((i) => i + 1);
              }}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
