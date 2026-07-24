"use client";

import { useEffect, useId, useRef, useState } from "react";
import { departmentAccent } from "@/lib/ui/department-accent";

type DepartmentFilterSelectProps = {
  departments: string[];
  /** Empty string / null means all departments. */
  value: string | null;
  onChange: (department: string | null) => void;
  id?: string;
  className?: string;
  /** Compact styling for the chart workspace panel. */
  size?: "sm" | "md";
  label?: string;
  /** Open the menu when true (e.g. Dashboard → Org Chart deep link). */
  defaultOpen?: boolean;
};

/**
 * Department filter with colour swatches in the menu (matches avatar accents).
 * Replaces the always-visible side legend - colours live in the filter itself.
 */
export function DepartmentFilterSelect({
  departments,
  value,
  onChange,
  id: idProp,
  className = "",
  size = "md",
  label = "Department",
  defaultOpen = false,
}: DepartmentFilterSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const sorted = [...departments].sort((a, b) => a.localeCompare(b));
  const selectedLabel = value?.trim() || "All departments";
  const selectedAccent = value?.trim()
    ? departmentAccent(value)
    : "transparent";

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };

  const triggerClass =
    size === "sm"
      ? "rounded-norma-sm border border-norma-border bg-norma-surface px-2 py-1.5 text-sm text-norma-ink"
      : "min-w-[10rem] rounded-norma-md border border-norma-border bg-norma-surface px-2.5 py-2 text-sm text-norma-ink shadow-norma-sm";

  return (
    <div ref={rootRef} className={`relative flex flex-col gap-0.5 ${className}`}>
      <label htmlFor={id} className="text-[11px] font-medium text-norma-ink-muted">
        {label}
      </label>
      <button
        id={id}
        type="button"
        className={`flex w-full items-center gap-2 text-left outline-none focus:border-norma-ink/40 ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
          style={{
            backgroundColor: selectedAccent,
            visibility: value?.trim() ? "visible" : "hidden",
          }}
        />
        <span className="min-w-0 flex-1 truncate font-normal">{selectedLabel}</span>
        <span aria-hidden className="text-norma-ink-muted">
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Departments"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-auto rounded-norma-md border border-norma-border bg-norma-surface py-1 shadow-norma-md"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={!value?.trim()}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-norma-surface-muted ${
                !value?.trim()
                  ? "bg-norma-lavender/40 font-medium text-norma-ink"
                  : "text-norma-ink"
              }`}
              onClick={() => pick(null)}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-norma-border bg-transparent"
              />
              All departments
            </button>
          </li>
          {sorted.map((dept) => {
            const selected = value?.trim() === dept;
            return (
              <li key={dept} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-norma-surface-muted ${
                    selected
                      ? "bg-norma-lavender/40 font-medium text-norma-ink"
                      : "text-norma-ink"
                  }`}
                  onClick={() => pick(dept)}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: departmentAccent(dept) }}
                  />
                  <span className="min-w-0 truncate">{dept}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
