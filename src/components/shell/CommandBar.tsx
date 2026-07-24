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
    hint: "Insights and department headcount",
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
    id: "nav-compare",
    label: "Compare reporting distance",
    hint: "Org Chart: pick two people",
    href: "/app?compare=1",
  },
  {
    id: "nav-health",
    label: "Go to Data Health",
    hint: "Cycles and missing managers",
    href: "/settings/data-health",
  },
  {
    id: "nav-help",
    label: "Go to Help",
    hint: "How-tos and assistant",
    href: "/help",
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
        className="hidden min-w-[17rem] items-center gap-3 rounded-full border border-norma-border bg-norma-surface-muted/90 px-4 py-3 text-left text-[0.95rem] text-norma-ink-muted hover:border-norma-ink/25 hover:text-norma-ink md:inline-flex lg:min-w-[22rem]"
        aria-label="Open command palette"
        title="Jump anywhere (⌘K)"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 opacity-70"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="min-w-0 flex-1 truncate">Jump to person or page…</span>
        <kbd className="shrink-0 rounded-md border border-norma-border bg-norma-surface px-1.5 py-0.5 font-mono text-[10px] text-norma-ink-muted">
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
            className="w-full max-w-2xl overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-md"
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
                placeholder="Jump to a person or page…"
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
