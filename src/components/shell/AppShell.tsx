import type { ReactNode } from "react";
import Link from "next/link";

type AppShellProps = {
  children: ReactNode;
  toolbar?: ReactNode;
  status?: ReactNode;
};

export function AppShell({ children, toolbar, status }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-norma-canvas">
      <a href="#org-chart" className="skip-link">
        Skip to organization chart
      </a>
      <AppHeader toolbar={toolbar} />
      <main
        id="main-content"
        className="relative flex flex-1 flex-col overflow-hidden"
      >
        {children}
      </main>
      <AppStatus>{status}</AppStatus>
    </div>
  );
}

function AppHeader({ toolbar }: { toolbar?: ReactNode }) {
  return (
    <header
      role="banner"
      className="flex h-14 shrink-0 items-center gap-4 border-b border-norma-border bg-norma-surface/95 px-4 shadow-norma-sm backdrop-blur-sm md:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-norma-sm bg-norma-prussian text-sm font-semibold text-norma-ink-inverse"
        >
          A
        </span>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-norma-display)] text-sm font-semibold tracking-tight text-norma-prussian">
            Acme Org Chart
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-norma-ink-subtle">
            Sandbox Corp · Remote HRIS
          </p>
        </div>
      </div>
      <nav className="ml-auto flex min-w-0 items-center gap-3" aria-label="App">
        <Link
          href="/welcome"
          className="hidden text-xs font-medium text-norma-ink-muted hover:text-norma-prussian sm:inline"
        >
          Welcome
        </Link>
        {toolbar ? (
          <div className="flex min-w-0 items-center gap-2">{toolbar}</div>
        ) : null}
      </nav>
    </header>
  );
}

function AppStatus({ children }: { children?: ReactNode }) {
  return (
    <footer
      role="contentinfo"
      className="flex h-9 shrink-0 items-center border-t border-norma-border bg-norma-surface-muted px-4 text-xs text-norma-ink-muted md:px-6"
    >
      {children ?? (
        <span>Acme Sandbox · read-only Remote · Markel/Neuro chrome</span>
      )}
    </footer>
  );
}
