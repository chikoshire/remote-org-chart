/**
 * Static product chrome mock for the marketing landing — no live data.
 * Mirrors Chart / shell cues so visitors see the product before login.
 */
export function MarketingProductMock() {
  return (
    <div
      className="marketing-mock relative h-full min-h-[28rem] w-full overflow-hidden bg-[#0b1f2a] text-[#f4f7f5] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      aria-hidden
    >
      {/* Soft atmosphere */}
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#75e8f0]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#e85d04]/15 blur-3xl" />

      {/* App chrome */}
      <div className="relative flex h-11 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <span className="rounded-md bg-white/8 px-10 py-1 font-[family-name:var(--font-norma-mono)] text-[10px] tracking-wide text-white/45">
            app.acme · Org chart
          </span>
        </div>
        <span className="hidden sm:inline font-[family-name:var(--font-norma-mono)] text-[10px] text-white/35">
          Live · Sandbox
        </span>
      </div>

      <div className="relative flex h-[calc(100%-2.75rem)]">
        {/* Mini rail */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-white/10 py-4 md:flex">
          {["Chart", "People", "Map"].map((label, i) => (
            <div
              key={label}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-[9px] font-semibold uppercase tracking-wider ${
                i === 0
                  ? "bg-[#e85d04] text-white"
                  : "bg-white/5 text-white/40"
              }`}
              title={label}
            >
              {label.slice(0, 1)}
            </div>
          ))}
        </div>

        {/* Chart canvas */}
        <div className="relative flex-1 overflow-hidden p-6 sm:p-8">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 640 420"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M320 78 L320 130 M320 130 L180 180 M320 130 L460 180 M180 220 L180 260 M460 220 L380 260 M460 220 L540 260"
              stroke="rgba(117,232,240,0.35)"
              strokeWidth="1.5"
            />
          </svg>

          <div className="absolute left-1/2 top-6 z-10 w-44 -translate-x-1/2">
            <div className="marketing-mock-node rounded-xl border border-white/15 bg-[#123040]/95 px-3 py-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e85d04] text-[11px] font-semibold text-white">
                  AL
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">Alex Lee</p>
                  <p className="truncate text-[10px] text-white/50">CEO</p>
                </div>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node marketing-mock-node-delay absolute left-[12%] top-[38%] z-10 w-40 rounded-xl border border-white/12 bg-[#123040]/90 px-3 py-2.5 sm:left-[18%]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75e8f0]/25 text-[11px] font-semibold text-[#75e8f0]">
                SR
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">Sam Ruiz</p>
                <p className="truncate text-[10px] text-white/50">Engineering</p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node marketing-mock-node-delay-2 absolute right-[12%] top-[38%] z-10 w-40 rounded-xl border border-white/12 bg-[#123040]/90 px-3 py-2.5 sm:right-[18%]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold">
                MK
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">Maya Kim</p>
                <p className="truncate text-[10px] text-white/50">People Ops</p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node absolute bottom-10 left-[22%] z-10 hidden w-36 rounded-xl border border-[#e85d04]/40 bg-[#123040]/95 px-3 py-2 ring-2 ring-[#e85d04]/25 sm:block">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e85d04]/30 text-[10px] font-semibold text-[#ffb347]">
                JD
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold">Jordan Diaz</p>
                <p className="truncate text-[9px] text-white/45">Selected</p>
              </div>
            </div>
          </div>

          <div className="marketing-mock-node absolute bottom-10 right-[18%] z-10 hidden w-36 rounded-xl border border-white/10 bg-[#123040]/85 px-3 py-2 md:block">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold">
                TP
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold">Taylor Park</p>
                <p className="truncate text-[9px] text-white/45">Design</p>
              </div>
            </div>
          </div>

          {/* Dock hint */}
          <div className="absolute bottom-4 right-4 hidden w-52 rounded-lg border border-white/10 bg-[#0b1f2a]/90 p-3 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#75e8f0]">
              Profile
            </p>
            <p className="mt-1 text-[12px] font-medium">Jordan Diaz</p>
            <p className="text-[10px] text-white/45">Reports to Maya Kim · PT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
