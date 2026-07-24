"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { personDeepLinkHref } from "@/lib/org/deep-links";
import { formatCountryLabel } from "@/lib/ui/format-country";
import { personMorphName } from "@/lib/ui/motion";
import { PersonAvatar } from "@/components/org/PersonAvatar";

export type PersonDetail = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  avatarUrl?: string | null;
  directReports: number;
  inCycle?: boolean;
  isRoot?: boolean;
  managerMissing?: boolean;
};

export type PersonDetailDrawerProps = {
  person: PersonDetail;
  pathToRoot: PersonDetail[];
  reports: PersonDetail[];
  onClose: () => void;
  onSelectPerson: (id: string) => void;
  /**
   * `overlay` (default): absolute sheet over the parent.
   * `dock`: side/bottom rail that shares space so the grid stays readable.
   */
  placement?: "overlay" | "dock";
};

export function PersonDetailDrawer({
  person,
  pathToRoot,
  reports,
  onClose,
  onSelectPerson,
  placement = "overlay",
}: PersonDetailDrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const name = person.fullName?.trim() || "Unknown person";
  const countryLabel = formatCountryLabel(person.country);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const docked = placement === "dock";

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, person.id]);

  useEffect(() => {
    setCopyState("idle");
  }, [person.id]);

  const copyLink = useCallback(async () => {
    const href = personDeepLinkHref(
      window.location.origin,
      window.location.pathname,
      person.id,
    );
    try {
      await navigator.clipboard.writeText(href);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }, [person.id]);

  return (
    <aside
      role="dialog"
      aria-modal={docked ? undefined : "true"}
      aria-labelledby={titleId}
      className={
        docked
          ? "bloom-enter flex h-[min(42%,22rem)] w-full shrink-0 flex-col border-t border-norma-border bg-norma-surface shadow-norma-md md:h-auto md:w-[360px] md:border-l md:border-t-0"
          : "bloom-enter absolute inset-x-0 bottom-0 z-30 flex max-h-[70%] flex-col border-t border-norma-border bg-norma-surface shadow-norma-md md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[360px] md:border-l md:border-t-0"
      }
      style={{ viewTransitionName: personMorphName(person.id) }}
      data-morph-person={person.id}
      data-drawer-placement={placement}
    >
      <div className="flex items-start gap-3 border-b border-norma-border px-4 py-3">
        <PersonAvatar
          personId={person.id}
          fullName={person.fullName}
          department={person.department}
          avatarUrl={person.avatarUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="truncate text-base font-semibold text-norma-prussian"
          >
            {name}
          </h2>
          <p className="truncate text-sm text-norma-ink-muted">
            {person.jobTitle?.trim() || "Not set"}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {person.inCycle ? (
              <span className="rounded-norma-sm bg-norma-danger-soft px-1.5 py-0.5 text-[10px] font-medium text-norma-danger">
                Cycle
              </span>
            ) : null}
            {person.managerMissing ? (
              <span className="rounded-norma-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900">
                Manager missing
              </span>
            ) : null}
            {!person.jobTitle?.trim() ||
            !person.department?.trim() ||
            !person.country?.trim() ? (
              <span className="rounded-norma-sm bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-norma-ink-muted">
                Incomplete fields
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="mt-1 text-xs font-medium text-norma-royal hover:underline"
          >
            {copyState === "copied"
              ? "Link copied"
              : copyState === "failed"
                ? "Copy failed. Select the URL from the address bar."
                : "Copy link"}
          </button>
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
            {person.department?.trim() || "Not set"}
          </dd>
          <dt className="text-norma-ink-subtle">Country</dt>
          <dd className="text-norma-prussian">{countryLabel || "Not set"}</dd>
          <dt className="text-norma-ink-subtle">Reports</dt>
          <dd className="text-norma-prussian">
            {person.directReports} direct
          </dd>
          {person.managerMissing ? (
            <>
              <dt className="text-norma-ink-subtle">Manager</dt>
              <dd className="text-amber-900">
                No manager on file (linked id missing from Remote)
              </dd>
            </>
          ) : person.isRoot ? (
            <>
              <dt className="text-norma-ink-subtle">Manager</dt>
              <dd className="text-norma-prussian">No manager on file</dd>
            </>
          ) : null}
          {person.inCycle ? (
            <>
              <dt className="text-norma-ink-subtle">Data</dt>
              <dd className="text-norma-danger">
                Reporting chain loops back on itself
              </dd>
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
          {person.managerMissing ? (
            <p className="mt-2 text-sm text-norma-ink-muted">
              Reporting chain has a gap. Fix the manager link in Remote so this
              person connects to the rest of the org.
            </p>
          ) : null}
          <ol className="mt-2 space-y-1">
            {pathToRoot.map((step, index) => {
              const isSelf = step.id === person.id;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={isSelf}
                    onClick={() => onSelectPerson(step.id)}
                    className={`flex w-full items-center gap-2.5 rounded-norma-sm px-2 py-1.5 text-left text-sm ${
                      isSelf
                        ? "bg-norma-accent-soft font-medium text-norma-royal"
                        : "text-norma-prussian hover:bg-norma-surface-muted"
                    }`}
                  >
                    <span className="w-4 shrink-0 font-mono text-[10px] text-norma-ink-subtle">
                      {index + 1}
                    </span>
                    <PersonAvatar
                      personId={step.id}
                      fullName={step.fullName}
                      department={step.department}
                      avatarUrl={step.avatarUrl}
                      size="sm"
                    />
                    <span className="min-w-0 truncate">
                      {step.fullName?.trim() || "Unknown"}
                      <span className="block truncate text-xs font-normal text-norma-ink-muted">
                        {step.jobTitle?.trim() || "Not set"}
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
                    className="flex w-full items-center gap-2.5 rounded-norma-sm px-2 py-1.5 text-left hover:bg-norma-surface-muted"
                  >
                    <PersonAvatar
                      personId={report.id}
                      fullName={report.fullName}
                      department={report.department}
                      avatarUrl={report.avatarUrl}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-norma-prussian">
                        {report.fullName?.trim() || "Unknown"}
                      </span>
                      <span className="block truncate text-xs text-norma-ink-muted">
                        {report.jobTitle?.trim() || "Not set"}
                      </span>
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
