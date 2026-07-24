import { AppShell } from "@/components/shell/AppShell";
import { EdgePreviewCanvas } from "@/components/org/EdgePreviewCanvas";

export default function Home() {
  return (
    <AppShell status={<span>Reporting edges + path highlight · GH#13</span>}>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="max-w-2xl px-2">
          <h1 className="font-[family-name:var(--font-norma-display)] text-[length:var(--norma-text-2xl)] text-norma-prussian">
            Organization
          </h1>
          <p className="mt-1 text-sm text-norma-ink-muted">
            Highlighted reporting path (royal) vs default edge (muted).
          </p>
        </div>
        <div
          className="min-h-[480px] flex-1 overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm"
          data-slot="chart-canvas"
        >
          <EdgePreviewCanvas />
        </div>
      </div>
    </AppShell>
  );
}
