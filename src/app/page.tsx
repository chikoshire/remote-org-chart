import { AppShell } from "@/components/shell/AppShell";
import { OrgChartCanvas } from "@/components/org/OrgChartCanvas";

export default function Home() {
  return (
    <AppShell
      status={
        <span className="truncate">
          Live sandbox org chart · tap a person to highlight their path
        </span>
      }
    >
      <div className="flex min-h-[100dvh] flex-1 flex-col gap-2 p-2 md:min-h-0 md:gap-3 md:p-6">
        <div className="max-w-2xl px-1">
          <h1 className="font-[family-name:var(--font-norma-display)] text-xl text-norma-prussian md:text-[length:var(--norma-text-2xl)]">
            Organization
          </h1>
          <p className="mt-1 hidden text-sm text-norma-ink-muted sm:block">
            Acme Sandbox Corp via Remote — interactive React Flow chart.
          </p>
        </div>
        <section
          id="org-chart"
          aria-label="Organization chart"
          className="min-h-[70dvh] flex-1 overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm md:min-h-[480px]"
          data-slot="chart-canvas"
          tabIndex={-1}
        >
          <OrgChartCanvas />
        </section>
      </div>
    </AppShell>
  );
}
