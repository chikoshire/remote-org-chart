import Image from "next/image";

type MarketingAppShotProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  /** Soft browser chrome around the shot */
  framed?: boolean;
};

/**
 * Real product screenshot - used instead of invented marketing mocks.
 * Uses contain (not cover) so UI chrome and sidebars are never cropped.
 */
export function MarketingAppShot({
  src,
  alt,
  priority = false,
  className = "",
  framed = true,
}: MarketingAppShotProps) {
  const image = (
    <Image
      src={src}
      alt={alt}
      width={1728}
      height={1025}
      priority={priority}
      className={
        framed
          ? "h-auto w-full rounded-[0.85rem] object-contain object-top"
          : `h-auto w-full object-contain object-top ${className}`
      }
      sizes="(max-width: 768px) 100vw, 60vw"
    />
  );

  if (!framed) {
    return <div className={className}>{image}</div>;
  }

  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] border border-norma-border/70 bg-norma-canvas shadow-[0_28px_80px_rgb(18_18_18/0.12)] ring-1 ring-white/70 ${className}`}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-norma-border/70 bg-white/90 px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-norma-rose" />
        <span className="h-2.5 w-2.5 rounded-full bg-norma-peach" />
        <span className="h-2.5 w-2.5 rounded-full bg-norma-mint" />
        <span className="ml-2 rounded-full bg-norma-surface-muted px-3 py-0.5 font-[family-name:var(--font-norma-mono)] text-[10px] text-norma-ink-muted">
          app.acme
        </span>
      </div>
      <div className="bg-norma-canvas p-3 sm:p-4">{image}</div>
    </div>
  );
}
