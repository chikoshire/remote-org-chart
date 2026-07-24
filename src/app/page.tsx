import { AppShell } from "@/components/shell/AppShell";
import { OrgChartCanvas } from "@/components/org/OrgChartCanvas";

export default function Home() {
  return (
    <AppShell
      status={
        <span className="truncate">
          Acme Sandbox · Chart or Directory · path highlight on select
        </span>
      }
    >
      <div className="relative flex min-h-[100dvh] flex-1 flex-col gap-3 p-3 md:min-h-0 md:gap-4 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 100% at 10% 0%, rgb(232 93 4 / 0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 90% 10%, rgb(42 157 143 / 0.16) 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 flex max-w-3xl flex-col gap-1 px-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-norma-royal">
            Acme Sandbox Corp
          </p>
          <h1 className="font-[family-name:var(--font-norma-display)] text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-tight text-norma-prussian">
            Who reports to whom
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-norma-ink-muted md:text-base">
            Live org graph from Remote — switch to Directory when you want a
            people browse instead of the tree.
          </p>
        </div>
        <section
          id="org-chart"
          aria-label="Organization chart"
          className="relative z-10 min-h-[70dvh] flex-1 overflow-hidden rounded-norma-lg border border-norma-border/80 bg-norma-surface/95 shadow-norma-md ring-1 ring-[#0b2a32]/[0.04] md:min-h-[480px]"
          data-slot="chart-canvas"
          tabIndex={-1}
        >
          <OrgChartCanvas />
        </section>
      </div>
    </AppShell>
  );
}
