import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  toolbar?: ReactNode;
  status?: ReactNode;
};

export function AppShell({ children, toolbar, status }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-norma-canvas">
      <AppHeader toolbar={toolbar} />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <AppStatus>{status}</AppStatus>
    </div>
  );
}

function AppHeader({ toolbar }: { toolbar?: ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-norma-border bg-norma-surface px-4 shadow-norma-sm md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-norma-sm bg-norma-royal text-sm font-semibold text-norma-ink-inverse"
        >
          R
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-norma-prussian">
            Remote Org Chart
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-norma-ink-subtle">
            Acme Sandbox Corp
          </p>
        </div>
      </div>
      {toolbar ? (
        <div className="ml-auto flex min-w-0 items-center gap-2">{toolbar}</div>
      ) : null}
    </header>
  );
}

function AppStatus({ children }: { children?: ReactNode }) {
  return (
    <footer className="flex h-9 shrink-0 items-center border-t border-norma-border bg-norma-surface-muted px-4 text-xs text-norma-ink-muted md:px-6">
      {children ?? (
        <span>Sandbox · read-only · Norma chrome</span>
      )}
    </footer>
  );
}
