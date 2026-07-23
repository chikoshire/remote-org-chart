import { AppShell } from "@/components/shell/AppShell";

export default function Home() {
  return (
    <AppShell
      status={
        <span>
          Tokens + chrome ready · chart canvas lands with React Flow
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-norma-display)] text-[length:var(--norma-text-2xl)] text-norma-prussian">
            Organization
          </h1>
          <p className="mt-2 text-norma-ink-muted">
            Product shell for Acme Sandbox Corp. The chart fills this canvas
            next.
          </p>
        </div>

        <div
          className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden rounded-norma-lg border border-dashed border-norma-border-strong bg-norma-surface shadow-norma-sm"
          data-slot="chart-canvas"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--norma-prussian) 12%, transparent) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <p className="relative z-[1] max-w-sm text-center text-sm text-norma-ink-subtle">
            Chart canvas slot
          </p>
        </div>
      </div>
    </AppShell>
  );
}
