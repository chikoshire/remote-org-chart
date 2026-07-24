import Link from "next/link";

type SurfaceStubProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

/** Placeholder for Org Intelligence surfaces until their feature parents land. */
export function SurfaceStub({
  title,
  description,
  eyebrow = "Acme",
}: SurfaceStubProps) {
  return (
    <div className="relative min-h-0 flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6 md:py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-norma-ink-subtle">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-norma-ink-muted">
          {description}
        </p>
        <p className="mt-8 text-sm text-norma-ink-muted">
          <Link href="/app" className="font-medium text-norma-royal hover:underline">
            Open Org Chart
          </Link>
        </p>
      </div>
    </div>
  );
}
