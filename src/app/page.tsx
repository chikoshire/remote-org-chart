import { AppShell } from "@/components/shell/AppShell";
import { OrgChartCanvas } from "@/components/org/OrgChartCanvas";

export default function Home() {
  return (
    <AppShell
      status={
        <span>
          Live sandbox org chart · click a person to highlight their reporting
          path
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-6">
        <div className="max-w-2xl px-1">
          <h1 className="font-[family-name:var(--font-norma-display)] text-[length:var(--norma-text-2xl)] text-norma-prussian">
            Organization
          </h1>
          <p className="mt-1 text-sm text-norma-ink-muted">
            Acme Sandbox Corp via Remote — interactive React Flow chart.
          </p>
        </div>
        <div
          className="min-h-[480px] flex-1 overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm"
          data-slot="chart-canvas"
        >
          <OrgChartCanvas />
        </div>
      </div>
    </AppShell>
  );
}
