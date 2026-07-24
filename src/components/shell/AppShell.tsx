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
      className="relative flex h-16 shrink-0 items-center gap-4 overflow-hidden border-b border-white/10 bg-[#0b2a32] px-4 text-[#f4f7f5] shadow-norma-md md:px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 120% at 0% 50%, #e85d04 0%, transparent 55%), radial-gradient(ellipse 50% 100% at 100% 0%, #2a9d8f 0%, transparent 45%)",
        }}
      />
      <div className="relative z-10 flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-norma-sm bg-[#e85d04] font-[family-name:var(--font-norma-display)] text-sm font-bold text-[#0b2a32]"
        >
          A
        </span>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-norma-display)] text-base font-semibold tracking-tight">
            Acme
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#9fd5de]">
            Org chart · Sandbox Corp
          </p>
        </div>
      </div>
      <nav
        className="relative z-10 ml-auto flex min-w-0 items-center gap-3"
        aria-label="App"
      >
        <Link
          href="/welcome"
          className="hidden text-xs font-medium text-[#9fd5de] underline-offset-4 hover:text-[#f4f7f5] hover:underline sm:inline"
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
      className="flex h-9 shrink-0 items-center border-t border-norma-border bg-[#0b2a32]/[0.04] px-4 text-xs text-norma-ink-muted md:px-6"
    >
      {children ?? (
        <span>Acme Sandbox · Remote HRIS · Markel/Neuro chrome</span>
      )}
    </footer>
  );
}
