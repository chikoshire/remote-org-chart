import { AppShell } from "@/components/shell/AppShell";
import { PersonNodeCard } from "@/components/org/PersonNodeCard";

export default function Home() {
  return (
    <AppShell status={<span>Person node variants · GH#12</span>}>
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-norma-display)] text-[length:var(--norma-text-2xl)] text-norma-prussian">
            Organization
          </h1>
          <p className="mt-2 text-norma-ink-muted">
            Person node design — default, selected, path, and root variants.
          </p>
        </div>

        <div
          className="flex min-h-[420px] flex-1 flex-wrap content-start items-start gap-6 rounded-norma-lg border border-norma-border bg-norma-surface p-8 shadow-norma-sm"
          data-slot="chart-canvas"
        >
          <PersonNodeCard
            fullName="Ada Lovelace"
            jobTitle="Chief Scientist"
            department="R&D"
            country="GB"
            directReports={4}
            variant="root"
          />
          <PersonNodeCard
            fullName="Grace Hopper"
            jobTitle="Engineering Manager"
            department="Engineering"
            country="US"
            directReports={8}
            variant="path"
          />
          <PersonNodeCard
            fullName="Katherine Johnson"
            jobTitle="Staff Analyst"
            department="Analytics"
            country="US"
            directReports={0}
            variant="selected"
          />
          <PersonNodeCard
            fullName="Alan Turing"
            jobTitle="Cryptographer"
            department="Security"
            country="GB"
            directReports={2}
            variant="default"
            inCycle
          />
        </div>
      </div>
    </AppShell>
  );
}
