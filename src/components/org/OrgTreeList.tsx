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

function TreeRow({
  node,
  depth,
  selectedId,
  onSelect,
  expanded,
  toggle,
}: {
  node: OrgChartPayloadNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  toggle: (id: string) => void;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(node.id);
  const selected = node.id === selectedId;
  const accent = departmentAccent(node.department);
  const name = node.fullName?.trim() || "Unknown person";
  const title = node.jobTitle?.trim() || "Not set";
  const department = node.department?.trim() || null;
  const countryLabel = formatCountryLabel(node.country);
  const teamSize = hasChildren ? countSubtree(node) : 0;
  const isRoot = depth === 0;

  return (
    <li>
      <div
        className={`group relative flex items-stretch gap-2 rounded-norma-lg border transition-[border-color,box-shadow,background-color] duration-200 ${
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

        <div className="flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3">
          {hasChildren ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-norma-md text-norma-ink-muted transition-colors hover:bg-norma-surface-muted hover:text-norma-prussian"
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? `Collapse ${name}`
                  : `Expand ${name}, ${children.length} reports`
              }
              onClick={() => toggle(node.id)}
            >
              <Chevron open={isExpanded} />
            </button>
          ) : (
            <span className="inline-flex h-8 w-8 shrink-0" aria-hidden />
          )}

          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={() => onSelect(node.id)}
            aria-current={selected ? "true" : undefined}
          >
            <PersonAvatar
              personId={node.id}
              fullName={node.fullName}
              department={node.department}
              avatarUrl={node.avatarUrl}
              size={isRoot ? "md" : "sm"}
            />
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-norma-prussian ${
                  isRoot
                    ? "font-[family-name:var(--font-norma-display)] text-[15px] font-semibold tracking-tight"
                    : "text-sm font-semibold"
                }`}
              >
                {name}
              </span>
              <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="truncate text-xs text-norma-ink-muted">
                  {title}
                </span>
                {department ? (
                  <span
                    className="inline-flex max-w-[10rem] truncate rounded-norma-sm px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian"
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
              </span>
            </span>

            <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
              {hasChildren ? (
                <span className="rounded-norma-sm bg-norma-surface-muted px-2 py-1 text-[11px] font-semibold text-norma-prussian">
                  {children.length === 1
                    ? "1 report"
                    : `${children.length} reports`}
                </span>
              ) : null}
              {teamSize > children.length ? (
                <span className="rounded-norma-sm bg-norma-highlight-soft px-2 py-1 text-[11px] font-medium text-norma-prussian">
                  {teamSize} in team
                </span>
              ) : null}
            </span>
          </button>
        </div>
      </div>

      {hasChildren && isExpanded ? (
        <ul
          className="relative ml-2 mt-2 space-y-2 rounded-norma-lg border border-norma-border/70 border-l-[3px] border-l-norma-spray/60 bg-[#eef5f2]/90 p-3"
          style={{ animation: "treeReveal 220ms ease-out" }}
        >
          {children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Nested reporting tree — card rows + team wells, secondary to React Flow chart. */
export function OrgTreeList({ roots, selectedId, onSelect }: OrgTreeListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const expandableIds = useMemo(() => collectExpandableIds(roots), [roots]);

  useEffect(() => {
    setExpanded((prev) => {
      if (prev.size > 0) return prev;
      return new Set(roots.map((r) => r.id));
    });
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
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-norma-border/70 bg-white/75 px-4 py-3 backdrop-blur-sm md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
            Reporting tree
          </p>
          <p className="text-sm text-norma-ink-muted">
            {roots.length === 1
              ? "1 top-level manager"
              : `${roots.length} top-level managers`}
            {" · "}
            expand branches to walk the hierarchy
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <ul
          aria-label="Organization tree list"
          className="mx-auto max-w-3xl space-y-3"
        >
          {roots.map((root) => (
            <TreeRow
              key={root.id}
              node={root}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
