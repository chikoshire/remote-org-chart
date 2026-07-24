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
import type { PersonProfilePayload } from "@/lib/remote/person-profile";
import { formatCountryLabel } from "@/lib/ui/format-country";
import { withViewTransition } from "@/lib/ui/motion";
import {
  readRemoteConnected,
  readSessionOrgPayload,
  writeSessionOrgPayload,
} from "@/lib/ui/remote-connection";

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
  if (!value?.trim()) return "—";
  return value
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
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

  const load = useCallback(async () => {
    if (!readRemoteConnected()) {
      setStatus("empty");
      setPeople([]);
      setProfile(null);
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    setProfileError(null);

    try {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        setPeople(session.nodes);
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
        setPeople(nodes);
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

  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const person = byId.get(personId) ?? null;

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
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-[#e85d04]/12 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[#2a9d8f]/14 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#0b2a32]/08 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/app/people"
            className="text-sm font-medium text-norma-ink-muted hover:text-norma-ink"
          >
            ← People
          </Link>
          <button
            type="button"
            className="text-sm font-semibold text-norma-royal hover:underline"
            onClick={() => {
              const search = withPersonSearchParam("", personId);
              void withViewTransition(() => {
                router.push(`/app${search}`);
              });
            }}
          >
            Show in chart
          </button>
        </div>

        <section className="norma-glass overflow-hidden rounded-norma-lg border border-norma-border/80 shadow-norma-md">
          <div
            aria-hidden
            className="h-28 bg-gradient-to-br from-[#0b2a32] via-[#1a4a52] to-[#2a9d8f] md:h-36"
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
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-ink md:text-3xl">
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

        <section className="norma-glass rounded-norma-lg border border-norma-border/80 p-5 shadow-norma-sm md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
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

        <section className="norma-glass rounded-norma-lg border border-norma-border/80 p-5 shadow-norma-sm md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
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
  const display = value?.trim() || "—";
  return (
    <div>
      <dt className="text-xs text-norma-ink-subtle">{label}</dt>
      <dd
        className={`mt-1 text-sm text-norma-ink ${mono ? "font-mono text-[13px]" : "font-medium"}`}
      >
        {display}
      </dd>
    </div>
  );
}
