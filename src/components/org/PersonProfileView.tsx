"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import { withPersonSearchParam } from "@/lib/org/deep-links";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
import {
  PERSON_OVERRIDES_CHANGED_EVENT,
  applyPersonOverrides,
  clearPersonOverride,
  hasPersonOverride,
  missingProfileFields,
  writePersonOverride,
} from "@/lib/org/person-overrides";
import type { PersonProfilePayload } from "@/lib/remote/person-profile";
import { formatCountryLabel } from "@/lib/ui/format-country";
import {
  personNameMorphName,
  withViewTransition,
} from "@/lib/ui/motion";
import {
  clearProfileReturn,
  defaultProfileReturn,
  readProfileReturn,
  type ProfileReturnState,
} from "@/lib/ui/profile-return";
import {
  readRemoteConnected,
  readSessionOrgPayload,
  writeSessionOrgPayload,
} from "@/lib/ui/remote-connection";
import { searchPeople } from "@/lib/org/search-people";

type FlatPerson = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  avatarUrl?: string | null;
  directReports: number;
  managerEmploymentId: string | null;
  inCycle?: boolean;
};

type OrgChartResponse = {
  ok: boolean;
  nodeCount: number;
  nodes?: FlatPerson[];
  message?: string;
  code?: string;
};

type ProfileResponse = {
  ok: boolean;
  profile?: PersonProfilePayload;
  message?: string;
};

function labelize(value: string | null | undefined): string {
  if (!value?.trim()) return "Not set";
  return value
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
  if (!value?.trim()) return "Not set";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(parsed));
}

export function PersonProfileView({ personId }: { personId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [people, setPeople] = useState<FlatPerson[]>([]);
  const [profile, setProfile] = useState<PersonProfilePayload | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<ProfileReturnState>(() =>
    defaultProfileReturn(),
  );
  const [editTitle, setEditTitle] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [managerQuery, setManagerQuery] = useState("");
  const [editManagerId, setEditManagerId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasLocalEdits, setHasLocalEdits] = useState(false);

  useEffect(() => {
    const stored = readProfileReturn(personId) ?? readProfileReturn();
    if (stored) setReturnTo(stored);
  }, [personId]);

  const load = useCallback(async () => {
    if (!readRemoteConnected()) {
      setStatus("empty");
      setPeople([]);
      setProfile(null);
      return;
    }
    setErrorMessage(null);
    setProfileError(null);

    try {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        setPeople(applyPersonOverrides(session.nodes));
        // Soft start: show org snapshot immediately while Remote profile loads.
        setStatus("ready");
      } else {
        setStatus("loading");
      }

      const [orgRes, profileRes] = await Promise.all([
        fetch("/api/org-chart"),
        fetch(`/api/people/${encodeURIComponent(personId)}`),
      ]);

      const orgBody = (await orgRes.json()) as OrgChartResponse;
      if (!orgRes.ok || !orgBody.ok) {
        const mapped = mapOrgChartHttpError(orgRes.status, orgBody);
        if (!(session?.ok && session.nodes?.length)) {
          setStatus("error");
          setErrorMessage(mapped.message);
          return;
        }
      } else {
        const nodes = orgBody.nodes ?? [];
        if (nodes.length === 0) {
          setStatus("empty");
          setPeople([]);
          return;
        }
        setPeople(applyPersonOverrides(nodes));
        writeSessionOrgPayload(orgBody);
      }

      const profileBody = (await profileRes.json()) as ProfileResponse;
      if (profileRes.ok && profileBody.ok && profileBody.profile) {
        setProfile(profileBody.profile);
      } else {
        setProfile(null);
        setProfileError(
          profileBody.message ?? "Couldn’t load extended Remote details.",
        );
      }

      setStatus("ready");
    } catch (err) {
      const mapped = mapOrgChartHttpError(0, {
        code: "network",
        message: err instanceof Error ? err.message : "Network error",
      });
      setStatus("error");
      setErrorMessage(mapped.message);
    }
  }, [personId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onOverrides = () => {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        setPeople(applyPersonOverrides(session.nodes));
      }
      setHasLocalEdits(hasPersonOverride(personId));
    };
    window.addEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
    return () =>
      window.removeEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
  }, [personId]);

  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const person = byId.get(personId) ?? null;

  useEffect(() => {
    setHasLocalEdits(hasPersonOverride(personId));
    setEditTitle(person?.jobTitle?.trim() || "");
    setEditDepartment(person?.department?.trim() || "");
    setEditCountry(person?.country?.trim() || "");
    setEditManagerId(person?.managerEmploymentId ?? null);
    setManagerQuery("");
  }, [person, personId]);

  const pathToRoot = useMemo(() => {
    const path: FlatPerson[] = [];
    let current: string | null = personId;
    const guard = new Set<string>();
    while (current && !guard.has(current)) {
      guard.add(current);
      const node = byId.get(current);
      if (!node) break;
      path.push(node);
      current = node.managerEmploymentId;
    }
    return path.reverse();
  }, [byId, personId]);

  const reports = useMemo(
    () => people.filter((p) => p.managerEmploymentId === personId),
    [people, personId],
  );

  const goBack = useCallback(() => {
    const target = returnTo.href || "/app/people";
    // Keep return state until the destination consumes scroll (People),
    // or clear after chart deep-link (Org Chart focuses via ?person=).
    const goingToChart =
      target === "/app" ||
      target.startsWith("/app?") ||
      target.startsWith("/app#");
    const goingToHealth = target.includes("/data-health");
    void withViewTransition(() => {
      router.push(target);
    }).then(() => {
      if (goingToChart || goingToHealth) clearProfileReturn();
    });
  }, [returnTo.href, router]);

  const managerSuggestions = useMemo(() => {
    const hits = searchPeople(
      people
        .filter((p) => p.id !== personId)
        .map((p) => ({
          id: p.id,
          fullName: p.fullName,
          jobTitle: p.jobTitle,
        })),
      managerQuery,
    );
    return hits.slice(0, 8);
  }, [managerQuery, people, personId]);

  const saveProfileEdits = useCallback(async () => {
    setSaveBusy(true);
    setSaveMessage(null);
    const nextValues = {
      jobTitle: editTitle.trim() || null,
      department: editDepartment.trim() || null,
      country: editCountry.trim() || null,
      managerEmploymentId: editManagerId,
    };

    try {
      const res = await fetch(`/api/people/${encodeURIComponent(personId)}`, {
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(nextValues),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        message?: string;
        persisted?: string[];
        localOnly?: string[];
        notes?: Record<string, string>;
        values?: typeof nextValues;
      };

      if (!res.ok || !body.ok) {
        // Config / hard failure: still keep local overlays so the demo stays usable.
        writePersonOverride(personId, nextValues);
        setHasLocalEdits(true);
        setSaveMessage(
          body.message ??
            "Couldn’t reach Remote write API. Changes saved locally in this browser.",
        );
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 2000);
        return;
      }

      const persisted = new Set(body.persisted ?? []);
      const localOnly = new Set(body.localOnly ?? []);
      const values = body.values ?? nextValues;

      // Overlays only for fields Remote rejected.
      const overlay: {
        jobTitle?: string | null;
        department?: string | null;
        country?: string | null;
        managerEmploymentId?: string | null;
      } = {};
      if (localOnly.has("jobTitle")) overlay.jobTitle = values.jobTitle;
      if (localOnly.has("department")) overlay.department = values.department;
      if (localOnly.has("country")) overlay.country = values.country;
      if (localOnly.has("managerEmploymentId")) {
        overlay.managerEmploymentId = values.managerEmploymentId;
      }

      // Replace overlays: keep only fields Remote rejected.
      clearPersonOverride(personId);
      if (Object.keys(overlay).length > 0) {
        writePersonOverride(personId, overlay);
        setHasLocalEdits(true);
      } else {
        setHasLocalEdits(false);
      }

      // Optimistic session snapshot update so Chart/People/Health see it immediately.
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        const nodes = session.nodes.map((n) =>
          n.id === personId
            ? {
                ...n,
                jobTitle: values.jobTitle,
                department: values.department,
                country: values.country,
                managerEmploymentId: values.managerEmploymentId,
              }
            : n,
        );
        writeSessionOrgPayload({ ...session, nodes });
        setPeople(applyPersonOverrides(nodes));
      }

      const remoteBits =
        persisted.size > 0
          ? `Saved to Remote: ${[...persisted].join(", ")}.`
          : "Nothing written to Remote.";
      const localBits =
        localOnly.size > 0
          ? ` Local overlay: ${[...localOnly].join(", ")}.`
          : "";
      const noteBits = body.notes
        ? ` ${Object.values(body.notes).filter(Boolean).join(" ")}`
        : "";
      setSaveMessage(`${remoteBits}${localBits}${noteBits}`.trim());
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      writePersonOverride(personId, nextValues);
      setHasLocalEdits(true);
      setSaveMessage(
        "Network error while writing to Remote. Changes saved locally in this browser.",
      );
    } finally {
      setSaveBusy(false);
    }
  }, [editCountry, editDepartment, editManagerId, editTitle, personId]);

  const clearLocalEdits = useCallback(() => {
    clearPersonOverride(personId);
    setHasLocalEdits(false);
    setSaveMessage(null);
    const session = readSessionOrgPayload() as OrgChartResponse | null;
    if (session?.ok && session.nodes?.length) {
      const raw = session.nodes.find((n) => n.id === personId);
      setEditTitle(raw?.jobTitle?.trim() || "");
      setEditDepartment(raw?.department?.trim() || "");
      setEditCountry(raw?.country?.trim() || "");
      setEditManagerId(raw?.managerEmploymentId ?? null);
      setPeople(applyPersonOverrides(session.nodes));
    }
  }, [personId]);

  if (status === "loading") return <ChartLoadingState />;
  if (status === "error") {
    return (
      <ChartErrorState
        title="Couldn’t load profile"
        description={errorMessage ?? "Something went wrong."}
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }
  if (status === "empty") {
    return (
      <ChartEmptyState
        title="No people to show"
        description="Connect Remote in Settings, or refresh once employments are available."
        action={
          <RetryButton label="Try again" onClick={() => void load()} />
        }
      />
    );
  }

  if (!person && !profile) {
    return (
      <ChartEmptyState
        title="Person not found"
        description="This employment isn’t in the current org snapshot."
        action={
          <Link
            href="/app/people"
            className="text-sm font-semibold text-norma-royal hover:underline"
          >
            Back to People
          </Link>
        }
      />
    );
  }

  const name =
    profile?.fullName?.trim() ||
    person?.fullName?.trim() ||
    "Unknown person";
  const title =
    profile?.jobTitle?.trim() || person?.jobTitle?.trim() || "No title";
  const department =
    profile?.department?.trim() || person?.department?.trim() || null;
  const countryLabel =
    formatCountryLabel(profile?.countryName ?? profile?.country) ||
    formatCountryLabel(person?.country);
  const avatarUrl = profile?.avatarUrl ?? person?.avatarUrl ?? null;
  const managerId = profile?.managerEmploymentId ?? person?.managerEmploymentId;
  const managerFromOrg = managerId ? byId.get(managerId) : null;
  const managerName =
    profile?.managerName?.trim() ||
    managerFromOrg?.fullName?.trim() ||
    null;

  return (
    <div className="relative min-h-0 flex-1 overflow-auto">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-norma-ink/12 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-norma-sky/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-norma-ink/08 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-medium text-norma-ink-muted hover:text-norma-ink"
          >
            ← {returnTo.label || "People"}
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-norma-royal hover:underline"
            onClick={() => {
              clearProfileReturn();
              const search = withPersonSearchParam("", personId);
              void withViewTransition(() => {
                router.push(`/app${search}`);
              });
            }}
          >
            Show in chart
          </button>
        </div>

        <section className="bloom-enter norma-glass overflow-hidden rounded-norma-lg border border-norma-border/80 shadow-norma-md">
          <div
            aria-hidden
            className="h-28 bg-gradient-to-br from-norma-lavender via-norma-sky to-norma-mint md:h-36"
          />
          <div className="relative px-5 pb-6 pt-0 md:px-8">
            <div className="-mt-12 flex justify-center md:-mt-14">
              <div className="rounded-full bg-norma-surface p-1.5 shadow-norma-md ring-1 ring-norma-border/70">
                <PersonAvatar
                  personId={personId}
                  fullName={name}
                  department={department}
                  avatarUrl={avatarUrl}
                  size="xl"
                  morph
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h1
                className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-ink md:text-3xl"
                style={{ viewTransitionName: personNameMorphName(personId) }}
                data-morph-name={personId}
              >
                {name}
              </h1>
              {profile?.pronouns ? (
                <p className="mt-1 text-sm text-norma-ink-subtle">
                  {profile.pronouns}
                </p>
              ) : null}
              <p className="mt-2 text-base text-norma-ink-muted">{title}</p>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-norma-ink-subtle">
                {department ? <span>{department}</span> : null}
                {countryLabel ? <span>{countryLabel}</span> : null}
                {profile?.shortId ? (
                  <span className="font-mono text-xs">#{profile.shortId}</span>
                ) : null}
              </p>
            </div>
          </div>
        </section>

        {hasLocalEdits ? (
          <p
            role="status"
            className="bloom-enter rounded-norma-md border border-norma-border bg-norma-highlight-soft/80 px-4 py-2.5 text-sm text-norma-prussian"
          >
            Showing local corrections on this device (not written to Remote).
          </p>
        ) : null}

        <section className="bloom-enter bloom-enter-delay-1 norma-glass rounded-norma-lg border border-norma-border/80 p-5 shadow-norma-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
                Fix profile data
              </h2>
              <p className="mt-1 text-sm text-norma-ink-muted">
                Department and manager write back to Remote when a write token is
                configured. Job title and country often stay as local overlays on
                active employments (Remote requires a contract amendment).
              </p>
            </div>
            {missingProfileFields({
              jobTitle: person?.jobTitle,
              department: person?.department,
              country: person?.country,
            }).length > 0 ? (
              <span className="rounded-norma-sm bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">
                Incomplete
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-medium text-norma-ink-subtle">
                Job title
              </span>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 w-full rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-ink outline-none focus:border-norma-royal"
                placeholder="e.g. Product Designer"
                autoComplete="off"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-norma-ink-subtle">
                Department
              </span>
              <input
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className="mt-1 w-full rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-ink outline-none focus:border-norma-royal"
                placeholder="e.g. Engineering"
                autoComplete="off"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-xs font-medium text-norma-ink-subtle">
                Country
              </span>
              <input
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                className="mt-1 w-full rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-ink outline-none focus:border-norma-royal"
                placeholder="e.g. Portugal or PT"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="mt-4 border-t border-norma-border/70 pt-4">
            <p className="text-xs font-medium text-norma-ink-subtle">Manager</p>
            <p className="mt-0.5 text-xs text-norma-ink-muted">
              Search someone in the org, or clear to make this person a root.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-norma-ink">
                {editManagerId
                  ? byId.get(editManagerId)?.fullName?.trim() ||
                    "Selected manager"
                  : "No manager (root)"}
              </p>
              {editManagerId ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-norma-royal hover:underline"
                  onClick={() => {
                    setEditManagerId(null);
                    setManagerQuery("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
            <input
              value={managerQuery}
              onChange={(e) => setManagerQuery(e.target.value)}
              className="mt-2 w-full rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-ink outline-none focus:border-norma-royal"
              placeholder="Search people to assign as manager…"
              autoComplete="off"
            />
            {managerQuery.trim() && managerSuggestions.length > 0 ? (
              <ul
                className="mt-1 max-h-40 overflow-auto rounded-norma-md border border-norma-border bg-norma-surface py-1 shadow-norma-sm"
                role="listbox"
              >
                {managerSuggestions.map((hit) => (
                  <li key={hit.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start px-3 py-1.5 text-left text-sm hover:bg-norma-accent-soft"
                      onClick={() => {
                        setEditManagerId(hit.id);
                        setManagerQuery("");
                      }}
                    >
                      <span className="font-medium text-norma-prussian">
                        {hit.fullName ?? "Unknown"}
                      </span>
                      <span className="text-xs text-norma-ink-muted">
                        {hit.jobTitle ?? "No title"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveProfileEdits()}
              disabled={saveBusy}
              className="norma-cta px-4 py-2 text-sm disabled:opacity-60"
            >
              {saveBusy
                ? "Saving…"
                : savedFlash
                  ? "Saved"
                  : "Save to Remote"}
            </button>
            {hasLocalEdits ? (
              <button
                type="button"
                onClick={clearLocalEdits}
                className="rounded-norma-sm border border-norma-border bg-norma-surface px-4 py-2 text-sm font-medium text-norma-ink-muted hover:text-norma-ink"
              >
                Clear local overlays
              </button>
            ) : null}
          </div>
          {saveMessage ? (
            <p className="mt-3 text-xs leading-relaxed text-norma-ink-muted">
              {saveMessage}
            </p>
          ) : null}
        </section>

        <section className="bloom-enter bloom-enter-delay-2 norma-glass rounded-norma-lg border border-norma-border/80 p-5 shadow-norma-sm md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
            About
          </h2>
          {profileError ? (
            <p className="mt-3 text-sm text-norma-ink-muted">{profileError}</p>
          ) : null}
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProfileField label="Work email" value={profile?.workEmail} mono />
            <ProfileField label="Login email" value={profile?.loginEmail} mono />
            <ProfileField label="Status" value={labelize(profile?.status)} />
            <ProfileField label="Type" value={labelize(profile?.type)} />
            <ProfileField
              label="Employment model"
              value={labelize(profile?.employmentModel)}
            />
            <ProfileField
              label="Lifecycle"
              value={labelize(profile?.lifecycleStage)}
            />
            <ProfileField
              label="Start date"
              value={formatDate(profile?.startDate)}
            />
            <ProfileField
              label="Seniority date"
              value={formatDate(profile?.seniorityDate)}
            />
          </dl>
        </section>

        <section className="bloom-enter bloom-enter-delay-3 norma-glass rounded-norma-lg border border-norma-border/80 p-5 shadow-norma-sm md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-muted">
            Reporting
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-norma-ink-subtle">Manager</dt>
              <dd className="mt-1 text-sm font-medium text-norma-ink">
                {managerId ? (
                  <Link
                    href={`/app/people/${managerId}`}
                    className="text-norma-royal hover:underline"
                  >
                    {managerName || "View manager"}
                  </Link>
                ) : (
                  "Top of reporting line"
                )}
              </dd>
              {profile?.managerEmail ? (
                <p className="mt-0.5 font-mono text-xs text-norma-ink-muted">
                  {profile.managerEmail}
                </p>
              ) : null}
            </div>
            <div>
              <dt className="text-xs text-norma-ink-subtle">Direct reports</dt>
              <dd className="mt-1 text-sm font-medium text-norma-ink">
                {reports.length === 1
                  ? "1 person"
                  : `${reports.length} people`}
              </dd>
            </div>
          </dl>

          <ol className="mt-5 space-y-1 border-t border-norma-border/70 pt-4">
            <li className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Path to root
            </li>
            {pathToRoot.map((step, index) => {
              const isSelf = step.id === personId;
              const stepName = step.fullName?.trim() || "Unknown";
              return (
                <li key={step.id}>
                  {isSelf ? (
                    <span className="flex items-center gap-2.5 rounded-norma-sm bg-norma-accent-soft px-2 py-1.5 text-sm font-medium text-norma-royal">
                      <span className="w-4 font-mono text-[10px] text-norma-ink-subtle">
                        {index + 1}
                      </span>
                      {stepName}
                    </span>
                  ) : (
                    <Link
                      href={`/app/people/${step.id}`}
                      className="flex items-center gap-2.5 rounded-norma-sm px-2 py-1.5 text-sm text-norma-ink hover:bg-norma-surface-muted"
                    >
                      <span className="w-4 font-mono text-[10px] text-norma-ink-subtle">
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
                        {stepName}
                        <span className="block truncate text-xs text-norma-ink-muted">
                          {step.jobTitle?.trim() || "Not set"}
                        </span>
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>

          {reports.length > 0 ? (
            <ul className="mt-5 space-y-1 border-t border-norma-border/70 pt-4">
              <li className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
                Direct reports
              </li>
              {reports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/app/people/${report.id}`}
                    className="flex items-center gap-2.5 rounded-norma-sm px-2 py-1.5 text-sm hover:bg-norma-surface-muted"
                  >
                    <PersonAvatar
                      personId={report.id}
                      fullName={report.fullName}
                      department={report.department}
                      avatarUrl={report.avatarUrl}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-norma-ink">
                        {report.fullName?.trim() || "Unknown"}
                      </span>
                      <span className="block truncate text-xs text-norma-ink-muted">
                        {report.jobTitle?.trim() || "Not set"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  const display = value?.trim() || "Not set";
  return (
    <div>
      <dt className="text-xs text-norma-ink-muted">{label}</dt>
      <dd
        className={`mt-1 text-sm text-norma-ink ${mono ? "font-mono text-[13px]" : "font-medium"}`}
      >
        {display}
      </dd>
    </div>
  );
}
