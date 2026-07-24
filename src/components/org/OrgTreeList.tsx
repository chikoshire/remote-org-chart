"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";
import { departmentAccent } from "@/lib/ui/department-accent";

type OrgTreeListProps = {
  roots: OrgChartPayloadNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

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

  return (
    <li>
      <div
        className={`flex items-center gap-1 rounded-norma-sm ${
          selected ? "bg-norma-accent-soft" : "hover:bg-norma-surface-muted"
        }`}
        style={{ paddingLeft: `${depth * 1.1 + 0.5}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-norma-sm text-norma-ink-muted hover:text-norma-prussian"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? `Collapse ${name}`
                : `Expand ${name}, ${children.length} reports`
            }
            onClick={() => toggle(node.id)}
          >
            {isExpanded ? "−" : "+"}
          </button>
        ) : (
          <span className="inline-flex h-8 w-8 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 text-left"
          onClick={() => onSelect(node.id)}
          aria-current={selected ? "true" : undefined}
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            {name
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("") || "?"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-norma-prussian">
              {name}
            </span>
            <span className="block truncate text-xs text-norma-ink-muted">
              {node.jobTitle?.trim() || "Not set"}
              {hasChildren ? ` · ${children.length} reports` : ""}
            </span>
          </span>
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <ul>
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

/** Optional indented tree presentation; React Flow remains the brief primary. */
export function OrgTreeList({ roots, selectedId, onSelect }: OrgTreeListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

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

  if (roots.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-norma-ink-muted">
        No people in this tree view.
      </p>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-auto bg-norma-surface/40 p-3">
      <ul
        aria-label="Organization tree list"
        className="rounded-norma-lg border border-norma-border bg-norma-surface py-2 shadow-norma-sm"
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
  );
}
