"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";
import { departmentAccent } from "@/lib/ui/department-accent";
import { formatCountryLabel } from "@/lib/ui/format-country";

type OrgTreeListProps = {
  roots: OrgChartPayloadNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type TreeDensity = "comfortable" | "compact";

function countSubtree(node: OrgChartPayloadNode): number {
  let total = 0;
  for (const child of node.children ?? []) {
    total += 1 + countSubtree(child);
  }
  return total;
}

function collectExpandableIds(nodes: OrgChartPayloadNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: OrgChartPayloadNode[]) => {
    for (const node of list) {
      if ((node.children?.length ?? 0) > 0) {
        ids.push(node.id);
        walk(node.children!);
      }
    }
  };
  walk(nodes);
  return ids;
}

/** Expand managers through `maxDepth` (0 = roots only). */
export function collectIdsToDepth(
  nodes: OrgChartPayloadNode[],
  maxDepth: number,
): string[] {
  const ids: string[] = [];
  const walk = (list: OrgChartPayloadNode[], depth: number) => {
    for (const node of list) {
      if ((node.children?.length ?? 0) > 0 && depth <= maxDepth) {
        ids.push(node.id);
        walk(node.children!, depth + 1);
      }
    }
  };
  walk(nodes, 0);
  return ids;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${
        open ? "rotate-90" : "rotate-0"
      }`}
      aria-hidden
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonCard({
  node,
  depth,
  selected,
  density,
  hasChildren,
  isExpanded,
  onToggle,
  onSelect,
}: {
  node: OrgChartPayloadNode;
  depth: number;
  selected: boolean;
  density: TreeDensity;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const accent = departmentAccent(node.department);
  const name = node.fullName?.trim() || "Unknown person";
  const title = node.jobTitle?.trim() || "Not set";
  const department = node.department?.trim() || null;
  const countryLabel = formatCountryLabel(node.country);
  const children = node.children ?? [];
  const teamSize = hasChildren ? countSubtree(node) : 0;
  const compact = density === "compact";
  const isRoot = depth === 0;

  return (
    <div
      className={`relative flex shrink-0 items-stretch rounded-norma-lg border transition-[border-color,box-shadow,background-color] duration-200 ${
        compact ? "w-[196px]" : "w-[236px]"
      } ${
        selected
          ? "border-norma-royal bg-white shadow-norma-md ring-2 ring-norma-royal/30"
          : isRoot
            ? "border-norma-border bg-white shadow-norma-md hover:border-norma-spray/55"
            : "border-norma-border/80 bg-white shadow-norma-sm hover:border-norma-spray/45 hover:shadow-norma-md"
      }`}
    >
      <span
        aria-hidden
        className={`shrink-0 rounded-l-norma-lg ${isRoot ? "w-1.5" : "w-1"}`}
        style={{ backgroundColor: accent }}
      />
      <div
        className={`flex min-w-0 flex-1 flex-col ${compact ? "gap-1.5 p-2.5" : "gap-2 p-3"}`}
      >
        <div className="flex items-start gap-2">
          {hasChildren ? (
            <button
              type="button"
              className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-norma-md text-norma-ink-muted transition-colors hover:bg-norma-surface-muted hover:text-norma-prussian"
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? `Collapse ${name}`
                  : `Expand ${name}, ${children.length} reports`
              }
              onClick={onToggle}
            >
              <Chevron open={isExpanded} />
            </button>
          ) : (
            <span className="inline-flex h-7 w-7 shrink-0" aria-hidden />
          )}
          <button
            type="button"
            className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
            onClick={onSelect}
            aria-current={selected ? "true" : undefined}
          >
            <PersonAvatar
              personId={node.id}
              fullName={node.fullName}
              department={node.department}
              avatarUrl={node.avatarUrl}
              size={compact ? "sm" : isRoot ? "md" : "sm"}
            />
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-norma-prussian ${
                  isRoot && !compact
                    ? "font-[family-name:var(--font-norma-display)] text-[15px] font-semibold tracking-tight"
                    : "text-sm font-semibold"
                }`}
              >
                {name}
              </span>
              <span
                className={`mt-0.5 block truncate text-norma-ink-muted ${
                  compact ? "text-[11px]" : "text-xs"
                }`}
              >
                {title}
              </span>
            </span>
          </button>
        </div>

        {!compact ? (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 pl-9">
            {department ? (
              <span
                className="inline-flex max-w-full truncate rounded-norma-sm px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 18%, white)`,
                }}
              >
                {department}
              </span>
            ) : null}
            {countryLabel ? (
              <span className="truncate text-[11px] text-norma-ink-subtle">
                {countryLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {hasChildren ? (
          <div className="flex flex-wrap gap-1.5 pl-9">
            <span className="rounded-norma-sm bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-norma-prussian">
              {children.length === 1 ? "1 report" : `${children.length} reports`}
            </span>
            {!compact && teamSize > children.length ? (
              <span className="rounded-norma-sm bg-norma-highlight-soft px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian">
                {teamSize} in team
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HorizontalBranch({
  node,
  depth,
  selectedId,
  onSelect,
  expanded,
  toggle,
  density,
}: {
  node: OrgChartPayloadNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  toggle: (id: string) => void;
  density: TreeDensity;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(node.id);
  const selected = node.id === selectedId;
  const gap = density === "compact" ? "gap-2" : "gap-3";

  return (
    <div className={`flex flex-row items-center ${gap}`}>
      <PersonCard
        node={node}
        depth={depth}
        selected={selected}
        density={density}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggle={() => toggle(node.id)}
        onSelect={() => onSelect(node.id)}
      />

      {hasChildren && isExpanded ? (
        <div className={`flex flex-row items-center ${gap}`}>
          <span
            aria-hidden
            className="h-px w-5 shrink-0 bg-norma-spray/55 md:w-7"
          />
          <div
            className={`relative flex flex-col border-l-2 border-norma-spray/45 pl-4 ${
              density === "compact" ? "gap-2 py-1" : "gap-3 py-2"
            }`}
            style={{ animation: "treeReveal 220ms ease-out" }}
          >
            {children.map((child) => (
              <div key={child.id} className="relative flex flex-row items-center">
                <span
                  aria-hidden
                  className="absolute top-1/2 left-[-1rem] h-px w-4 -translate-y-1/2 bg-norma-spray/55"
                />
                <HorizontalBranch
                  node={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expanded={expanded}
                  toggle={toggle}
                  density={density}
                />
              </div>
            ))}
          </div>
        </div>
      ) : hasChildren ? (
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-norma-md border border-dashed border-norma-border bg-white/80 px-2 text-[11px] font-semibold text-norma-ink-muted hover:border-norma-spray/50 hover:text-norma-prussian"
          onClick={() => toggle(node.id)}
          aria-label={`Expand ${node.fullName?.trim() || "branch"}`}
        >
          +{children.length}
        </button>
      ) : null}
    </div>
  );
}

/** Left-to-right reporting tree — secondary to React Flow chart. */
export function OrgTreeList({ roots, selectedId, onSelect }: OrgTreeListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [density, setDensity] = useState<TreeDensity>("comfortable");
  const [seeded, setSeeded] = useState(false);
  const expandableIds = useMemo(() => collectExpandableIds(roots), [roots]);

  useEffect(() => {
    // Default: expand two levels (roots + their direct-report managers).
    setExpanded(new Set(collectIdsToDepth(roots, 1)));
    setSeeded(true);
  }, [roots]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(expandableIds));
  }, [expandableIds]);

  const expandTwoLevels = useCallback(() => {
    setExpanded(new Set(collectIdsToDepth(roots, 1)));
  }, [roots]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  if (roots.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-norma-ink-muted">
        No people in this tree view.
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(165deg,#e8f4f1_0%,#f4f7f5_48%,#eef3f8_100%)]">
      <style>{`
        @keyframes treeReveal {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-norma-border/70 bg-white/75 px-4 py-3 backdrop-blur-sm md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
            Reporting tree
          </p>
          <p className="text-sm text-norma-ink-muted">
            {roots.length === 1
              ? "1 top-level manager"
              : `${roots.length} top-level managers`}
            {" · "}
            left to right hierarchy
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex rounded-norma-md border border-norma-border bg-white p-0.5 shadow-norma-sm"
            role="group"
            aria-label="Tree density"
          >
            <button
              type="button"
              aria-pressed={density === "comfortable"}
              className={`rounded-norma-sm px-2.5 py-1.5 text-[11px] font-semibold ${
                density === "comfortable"
                  ? "bg-[#e85d04] text-norma-prussian"
                  : "text-norma-ink-muted hover:text-norma-prussian"
              }`}
              onClick={() => setDensity("comfortable")}
            >
              Comfortable
            </button>
            <button
              type="button"
              aria-pressed={density === "compact"}
              className={`rounded-norma-sm px-2.5 py-1.5 text-[11px] font-semibold ${
                density === "compact"
                  ? "bg-[#e85d04] text-norma-prussian"
                  : "text-norma-ink-muted hover:text-norma-prussian"
              }`}
              onClick={() => setDensity("compact")}
            >
              Compact
            </button>
          </div>
          <button
            type="button"
            className="rounded-norma-md border border-norma-border bg-white px-2.5 py-1.5 text-xs font-semibold text-norma-prussian shadow-norma-sm hover:border-norma-spray/50"
            onClick={expandTwoLevels}
          >
            2 levels
          </button>
          <button
            type="button"
            className="rounded-norma-md border border-norma-border bg-white px-2.5 py-1.5 text-xs font-semibold text-norma-prussian shadow-norma-sm hover:border-norma-spray/50"
            onClick={expandAll}
          >
            Expand all
          </button>
          <button
            type="button"
            className="rounded-norma-md border border-norma-border bg-white px-2.5 py-1.5 text-xs font-semibold text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian"
            onClick={collapseAll}
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 md:p-5">
        {!seeded ? null : (
          <ul
            aria-label="Organization tree list"
            className={`flex min-w-min flex-col ${
              density === "compact" ? "gap-6" : "gap-10"
            }`}
          >
            {roots.map((root) => (
              <li key={root.id}>
                <HorizontalBranch
                  node={root}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expanded={expanded}
                  toggle={toggle}
                  density={density}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
