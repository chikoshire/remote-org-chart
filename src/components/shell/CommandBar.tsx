"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withPersonSearchParam } from "@/lib/org/deep-links";
import { searchPeople, type SearchablePerson } from "@/lib/org/search-people";
import { readSessionOrgPayload } from "@/lib/ui/remote-connection";
import { withViewTransition } from "@/lib/ui/motion";

type NavAction = {
  id: string;
  label: string;
  hint: string;
  href: string;
};

const NAV_ACTIONS: NavAction[] = [
  {
    id: "nav-dashboard",
    label: "Go to Dashboard",
    hint: "Organisation insights",
    href: "/app/dashboard",
  },
  {
    id: "nav-chart",
    label: "Go to Org Chart",
    hint: "Reporting tree",
    href: "/app",
  },
  {
    id: "nav-people",
    label: "Go to People",
    hint: "Directory",
    href: "/app/people",
  },
  {
    id: "nav-departments",
    label: "Go to Departments",
    hint: "Teams by department",
    href: "/app/departments",
  },
  {
    id: "nav-health",
    label: "Go to Data Health",
    hint: "Cycles and missing managers",
    href: "/app/data-health",
  },
  {
    id: "nav-settings",
    label: "Go to Settings",
    hint: "Remote connect and preferences",
    href: "/settings",
  },
];

type ResultItem =
  | { kind: "person"; person: SearchablePerson }
  | { kind: "nav"; action: NavAction };

function peopleFromSession(): SearchablePerson[] {
  const session = readSessionOrgPayload() as {
    ok?: boolean;
    nodes?: Array<{
      id: string;
      fullName?: string | null;
      jobTitle?: string | null;
    }>;
  } | null;
  if (!session?.ok || !session.nodes?.length) return [];
  return session.nodes.map((n) => ({
    id: n.id,
    fullName: n.fullName ?? null,
    jobTitle: n.jobTitle ?? null,
  }));
}

export function CommandBar() {
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<SearchablePerson[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    setPeople(peopleFromSession());
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else openPalette();
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open, openPalette]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || people.length > 0) return;
    let cancelled = false;
    void fetch("/api/org-chart")
      .then(async (res) => {
        const body = (await res.json()) as {
          ok?: boolean;
          nodes?: SearchablePerson[];
        };
        if (!cancelled && body.ok && body.nodes) {
          setPeople(
            body.nodes.map((n) => ({
              id: n.id,
              fullName: n.fullName ?? null,
              jobTitle: n.jobTitle ?? null,
            })),
          );
        }
      })
      .catch(() => {
        // palette still works for navigation actions
      });
    return () => {
      cancelled = true;
    };
  }, [open, people.length]);

  const results: ResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const personHits = searchPeople(people, query, 6).map((person) => ({
      kind: "person" as const,
      person,
    }));
    const navHits = NAV_ACTIONS.filter((action) => {
      if (!q) return true;
      return (
        action.label.toLowerCase().includes(q) ||
        action.hint.toLowerCase().includes(q)
      );
    }).map((action) => ({ kind: "nav" as const, action }));
    return [...personHits, ...navHits].slice(0, 10);
  }, [people, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const runItem = useCallback(
    (item: ResultItem) => {
      const href =
        item.kind === "person"
          ? `/app${withPersonSearchParam("", item.person.id)}`
          : item.action.href;
      void withViewTransition(() => {
        router.push(href);
      });
      close();
    },
    [close, router],
  );

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="hidden rounded-norma-sm border border-norma-border bg-norma-surface-muted px-2.5 py-1.5 text-xs font-medium text-norma-ink-muted hover:text-norma-prussian md:inline-flex"
        aria-label="Open command bar"
        title="Search (⌘K)"
      >
        Search
        <kbd className="ml-2 font-mono text-[10px] text-norma-ink-subtle">
          ⌘K
        </kbd>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-norma-overlay/60 px-4 pt-[12vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-lg overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-md"
          >
            <h2 id={titleId} className="sr-only">
              Command bar
            </h2>
            <label className="block border-b border-norma-border px-3 py-2">
              <span className="sr-only">Search people and pages</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) =>
                      Math.min(i + 1, Math.max(results.length - 1, 0)),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && results[activeIndex]) {
                    e.preventDefault();
                    runItem(results[activeIndex]!);
                  }
                }}
                placeholder="Search people or jump to a page…"
                className="w-full bg-transparent py-2 text-sm text-norma-ink outline-none placeholder:text-norma-ink-subtle"
                autoComplete="off"
              />
            </label>
            <ul
              role="listbox"
              aria-label="Command results"
              className="max-h-80 overflow-auto py-1"
            >
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-norma-ink-muted">
                  No matches.
                </li>
              ) : (
                results.map((item, index) => {
                  const active = index === activeIndex;
                  if (item.kind === "person") {
                    const name =
                      item.person.fullName?.trim() || "Unknown person";
                    return (
                      <li key={`person-${item.person.id}`} role="option" aria-selected={active}>
                        <button
                          type="button"
                          className={`flex w-full flex-col px-4 py-2.5 text-left ${
                            active
                              ? "bg-norma-accent-soft"
                              : "hover:bg-norma-surface-muted"
                          }`}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => runItem(item)}
                        >
                          <span className="text-sm font-medium text-norma-prussian">
                            {name}
                          </span>
                          <span className="text-xs text-norma-ink-muted">
                            {item.person.jobTitle?.trim() || "Not set"} · Open
                            in Org Chart
                          </span>
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={item.action.id} role="option" aria-selected={active}>
                      <button
                        type="button"
                        className={`flex w-full flex-col px-4 py-2.5 text-left ${
                          active
                            ? "bg-norma-accent-soft"
                            : "hover:bg-norma-surface-muted"
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => runItem(item)}
                      >
                        <span className="text-sm font-medium text-norma-prussian">
                          {item.action.label}
                        </span>
                        <span className="text-xs text-norma-ink-muted">
                          {item.action.hint}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
