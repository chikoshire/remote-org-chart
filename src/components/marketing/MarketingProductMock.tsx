/**
 * Static product chrome mock for the marketing landing — no live data.
 * Floating status chips echo remote.com’s hero depth without copying assets.
 */
export function MarketingProductMock() {
  return (
    <div
      className="marketing-mock relative h-full min-h-[28rem] w-full overflow-hidden bg-norma-canvas text-norma-ink"
      aria-hidden
    >
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-norma-lavender/80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-norma-peach/70 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-48 w-48 rounded-full bg-norma-sky/60 blur-3xl" />
      <div className="pointer-events-none absolute left-1/4 bottom-1/4 h-40 w-40 rounded-full bg-norma-mint/50 blur-3xl" />
      <div className="marketing-grain pointer-events-none absolute inset-0 opacity-20" />

      <div className="norma-glass relative flex h-11 items-center gap-3 border-b border-norma-border/70 px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-norma-rose" />
          <span className="h-2.5 w-2.5 rounded-full bg-norma-peach" />
          <span className="h-2.5 w-2.5 rounded-full bg-norma-mint" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <span className="rounded-full bg-norma-surface-muted px-10 py-1 font-[family-name:var(--font-norma-mono)] text-[10px] tracking-wide text-norma-ink-muted">
            app.acme · Org chart
          </span>
        </div>
        <span className="hidden font-[family-name:var(--font-norma-mono)] text-[10px] text-norma-ink-subtle sm:inline">
          Live · Sandbox
        </span>
      </div>

      <div className="relative flex h-[calc(100%-2.75rem)]">
        <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-norma-border/60 py-4 md:flex">
          {["Chart", "People", "Map"].map((label, i) => (
            <div
              key={label}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                i === 0
                  ? "bg-norma-ink text-norma-ink-inverse"
                  : "bg-norma-surface text-norma-ink-muted"
              }`}
              title={label}
            >
              {label.slice(0, 1)}
            </div>
          ))}
        </div>

        <div className="relative flex-1 overflow-hidden p-6 sm:p-8">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 640 420"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              className="marketing-mock-path"
              d="M320 78 L320 130 M320 130 L180 180 M320 130 L460 180 M180 220 L180 260 M460 220 L380 260 M460 220 L540 260"
              stroke="rgba(18,18,18,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="marketing-float-chip marketing-float-chip-a absolute left-[3%] top-[12%] z-20 hidden max-w-[11rem] rounded-2xl border border-norma-border/70 bg-white/90 px-3 py-2.5 shadow-norma-md backdrop-blur sm:block">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
              Sync
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-norma-ink">
              Remote employments
            </p>
            <p className="text-[10px] text-norma-success">Live · 42 people</p>
          </div>

          <div className="marketing-float-chip marketing-float-chip-b absolute right-[2%] top-[18%] z-20 hidden max-w-[10.5rem] rounded-2xl border border-norma-border/70 bg-white/90 px-3 py-2.5 shadow-norma-md backdrop-blur md:block">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
              Data health
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-norma-ink">
              3 incomplete
            </p>
            <p className="text-[10px] text-norma-ink-muted">Managers missing</p>
          </div>

          <div className="absolute left-1/2 top-6 z-10 w-44 -translate-x-1/2">
            <div className="marketing-mock-node marketing-mock-pop norma-glass rounded-norma-lg border border-norma-border/70 px-3 py-2.5 shadow-norma-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-norma-ink text-[11px] font-semibold text-norma-ink-inverse">
                  AL
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">Alex Lee</p>
                  <p className="truncate text-[10px] text-norma-ink-muted">CEO</p>
                </div>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node marketing-mock-pop marketing-mock-node-delay absolute left-[12%] top-[38%] z-10 w-40 rounded-norma-lg border border-norma-border/60 bg-norma-lavender/90 px-3 py-2.5 shadow-norma-sm sm:left-[18%]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[11px] font-semibold text-norma-ink">
                SR
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">Sam Ruiz</p>
                <p className="truncate text-[10px] text-norma-ink-muted">
                  Engineering
                </p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node marketing-mock-pop marketing-mock-node-delay-2 absolute right-[12%] top-[38%] z-10 w-40 rounded-norma-lg border border-norma-border/60 bg-norma-mint/90 px-3 py-2.5 shadow-norma-sm sm:right-[18%]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[11px] font-semibold">
                MK
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">Maya Kim</p>
                <p className="truncate text-[10px] text-norma-ink-muted">
                  People Ops
                </p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node marketing-mock-pop marketing-mock-node-delay-3 absolute bottom-10 left-[22%] z-10 hidden w-36 rounded-norma-lg border border-norma-ink/20 bg-norma-peach/95 px-3 py-2 shadow-norma-sm ring-2 ring-norma-ink/10 sm:block">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[10px] font-semibold">
                JD
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold">Jordan Diaz</p>
                <p className="truncate text-[9px] text-norma-ink-muted">Selected</p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node marketing-mock-pop marketing-mock-node-delay-4 absolute bottom-10 right-[18%] z-10 hidden w-36 rounded-norma-lg border border-norma-border/60 bg-norma-sky/90 px-3 py-2 shadow-norma-sm md:block">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[10px] font-semibold">
                TP
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold">Taylor Park</p>
                <p className="truncate text-[9px] text-norma-ink-muted">Design</p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-drawer norma-glass absolute bottom-4 right-4 hidden w-52 rounded-norma-lg border border-norma-border/70 p-3 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
              Profile
            </p>
            <p className="mt-1 text-[12px] font-medium">Jordan Diaz</p>
            <p className="text-[10px] text-norma-ink-muted">
              Reports to Maya Kim · PT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
