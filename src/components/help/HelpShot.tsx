"use client";

export type HelpShotPointer =
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "nw";

export type HelpShotMark = {
  /** Horizontal position as % of image width (0–100). */
  x: number;
  /** Vertical position as % of image height (0–100). */
  y: number;
  /** Short label shown in the numbered pin (usually "1", "2", …). */
  label: string;
  /** Caption listed under the figure. */
  caption: string;
  /**
   * Optional arrow pointing at the circled element from this compass direction.
   * Example: `"se"` draws an arrow from the southeast toward the pin.
   */
  pointer?: HelpShotPointer;
};

export type HelpShotProps = {
  src: string;
  alt: string;
  marks?: HelpShotMark[];
  /** Optional intro line above the figure. */
  lead?: string;
};

const POINTER_TRANSFORM: Record<HelpShotPointer, string> = {
  // Default SVG points south; rotate so the tip aims at the pin.
  n: "translate(-50%, -130%) rotate(0deg)",
  ne: "translate(42%, -118%) rotate(-45deg)",
  e: "translate(130%, -50%) rotate(-90deg)",
  se: "translate(42%, 42%) rotate(-135deg)",
  s: "translate(-50%, 30%) rotate(180deg)",
  sw: "translate(-142%, 42%) rotate(135deg)",
  w: "translate(-130%, -50%) rotate(90deg)",
  nw: "translate(-142%, -118%) rotate(45deg)",
};

/**
 * Product screenshot with numbered callout pins, highlight rings, and optional
 * pointer arrows for Help KB pages.
 */
export function HelpShot({ src, alt, marks = [], lead }: HelpShotProps) {
  return (
    <figure className="my-6 overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm">
      {lead ? (
        <figcaption className="border-b border-norma-border/70 px-4 py-3 text-sm text-norma-ink-muted">
          {lead}
        </figcaption>
      ) : null}
      <div className="bg-norma-canvas px-2 py-3 md:px-3 md:py-4">
        <div className="relative">
          {/* Help KB static assets; callout overlay needs natural sizing */}
          <img src={src} alt={alt} className="h-auto w-full" />
          {marks.map((mark) => (
            <span
              key={`${mark.label}-${mark.x}-${mark.y}`}
              className="pointer-events-none absolute z-[1]"
              style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              aria-hidden
            >
              <span className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-norma-spray/90 bg-norma-spray/15 shadow-[0_0_0_3px_rgb(18_18_18_/_0.12)]" />
              <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-norma-ink text-[0.7rem] font-bold text-norma-ink-inverse shadow-norma-md">
                {mark.label}
              </span>
              {mark.pointer ? (
                <svg
                  viewBox="0 0 24 40"
                  className="absolute left-1/2 top-1/2 h-10 w-6 text-norma-ink drop-shadow-sm"
                  style={{ transform: POINTER_TRANSFORM[mark.pointer] }}
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 4v24"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 20l7 10 7-10"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="4" r="3" fill="currentColor" />
                </svg>
              ) : null}
            </span>
          ))}
        </div>
      </div>
      {marks.length > 0 ? (
        <ol className="space-y-2 border-t border-norma-border/70 px-4 py-3 text-sm text-norma-ink-muted">
          {marks.map((mark) => (
            <li key={`cap-${mark.label}`} className="flex gap-2.5">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-norma-ink text-[0.65rem] font-bold text-norma-ink-inverse">
                {mark.label}
              </span>
              <span>
                <span className="font-medium text-norma-ink">
                  Callout {mark.label}.
                </span>{" "}
                {mark.caption}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </figure>
  );
}
