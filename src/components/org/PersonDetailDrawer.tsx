"use client";

import { useEffect, useId, useRef } from "react";

export type PersonDetail = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  directReports: number;
  inCycle?: boolean;
  isRoot?: boolean;
};

export type PersonDetailDrawerProps = {
  person: PersonDetail;
  pathToRoot: PersonDetail[];
  reports: PersonDetail[];
  onClose: () => void;
  onSelectPerson: (id: string) => void;
};

function initials(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function PersonDetailDrawer({
  person,
  pathToRoot,
  reports,
  onClose,
  onSelectPerson,
}: PersonDetailDrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const name = person.fullName?.trim() || "Unknown person";

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, person.id]);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="absolute inset-x-0 bottom-0 z-30 flex max-h-[70%] flex-col border-t border-norma-border bg-norma-surface shadow-norma-md md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[360px] md:border-l md:border-t-0"
    >
      <div className="flex items-start gap-3 border-b border-norma-border px-4 py-3">
        <span
          aria-hidden
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-norma-accent-soft text-sm font-semibold text-norma-royal"
        >
          {initials(person.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="truncate text-base font-semibold text-norma-prussian"
          >
            {name}
          </h2>
          <p className="truncate text-sm text-norma-ink-muted">
            {person.jobTitle?.trim() || "No title"}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-norma-sm text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
          aria-label="Close person details"
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-norma-ink-subtle">Department</dt>
          <dd className="text-norma-prussian">
            {person.department?.trim() || "—"}
          </dd>
          <dt className="text-norma-ink-subtle">Country</dt>
          <dd className="text-norma-prussian">{person.country?.trim() || "—"}</dd>
          <dt className="text-norma-ink-subtle">Reports</dt>
          <dd className="text-norma-prussian">
            {person.directReports} direct
          </dd>
          {person.isRoot ? (
            <>
              <dt className="text-norma-ink-subtle">Role</dt>
              <dd className="text-norma-prussian">Organization root</dd>
            </>
          ) : null}
          {person.inCycle ? (
            <>
              <dt className="text-norma-ink-subtle">Data</dt>
              <dd className="text-norma-danger">On a reporting cycle</dd>
            </>
          ) : null}
        </dl>

        <section aria-labelledby={`${titleId}-path`}>
          <h3
            id={`${titleId}-path`}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle"
          >
            Path to root
          </h3>
          <ol className="mt-2 space-y-1">
            {pathToRoot.map((step, index) => {
              const isSelf = step.id === person.id;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={isSelf}
                    onClick={() => onSelectPerson(step.id)}
                    className={`flex w-full items-center gap-2 rounded-norma-sm px-2 py-1.5 text-left text-sm ${
                      isSelf
                        ? "bg-norma-accent-soft font-medium text-norma-royal"
                        : "text-norma-prussian hover:bg-norma-surface-muted"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-norma-ink-subtle">
                      {index + 1}
                    </span>
                    <span className="min-w-0 truncate">
                      {step.fullName?.trim() || "Unknown"}
                      <span className="block truncate text-xs font-normal text-norma-ink-muted">
                        {step.jobTitle?.trim() || "No title"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby={`${titleId}-reports`}>
          <h3
            id={`${titleId}-reports`}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle"
          >
            Direct reports
          </h3>
          {reports.length === 0 ? (
            <p className="mt-2 text-sm text-norma-ink-muted">No direct reports</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {reports.map((report) => (
                <li key={report.id}>
                  <button
                    type="button"
                    onClick={() => onSelectPerson(report.id)}
                    className="flex w-full flex-col rounded-norma-sm px-2 py-1.5 text-left hover:bg-norma-surface-muted"
                  >
                    <span className="truncate text-sm font-medium text-norma-prussian">
                      {report.fullName?.trim() || "Unknown"}
                    </span>
                    <span className="truncate text-xs text-norma-ink-muted">
                      {report.jobTitle?.trim() || "No title"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
