import { AppShell } from "@/components/shell/AppShell";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";

export default function Home() {
  return (
    <AppShell status={<span>State surfaces · GH#14</span>}>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="max-w-2xl px-2">
          <h1 className="font-[family-name:var(--font-norma-display)] text-[length:var(--norma-text-2xl)] text-norma-prussian">
            Organization
          </h1>
          <p className="mt-1 text-sm text-norma-ink-muted">
            Loading, empty, and error surfaces for the chart canvas.
          </p>
        </div>
        <div className="grid flex-1 gap-4 lg:grid-cols-3">
          <div className="overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm">
            <ChartLoadingState />
          </div>
          <div className="overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm">
            <ChartEmptyState />
          </div>
          <div className="overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm">
            <ChartErrorState action={<RetryButton />} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
