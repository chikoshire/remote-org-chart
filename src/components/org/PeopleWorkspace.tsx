"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import {
  PeopleDirectory,
  type DirectoryPerson,
} from "@/components/org/PeopleDirectory";
import {
  PersonDetailDrawer,
  type PersonDetail,
} from "@/components/org/PersonDetailDrawer";
import { withPersonSearchParam } from "@/lib/org/deep-links";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
import {
  PERSON_OVERRIDES_CHANGED_EVENT,
  applyPersonOverrides,
} from "@/lib/org/person-overrides";
import { ORG_UPDATED_EVENT } from "@/lib/org/live-updates";
import { withViewTransition } from "@/lib/ui/motion";
import { consumeReturnScrollIfMatching } from "@/lib/ui/profile-return";
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

function sessionPeople(): FlatPerson[] | null {
  const session = readSessionOrgPayload() as OrgChartResponse | null;
  if (!session?.ok || !session.nodes?.length) return null;
  return applyPersonOverrides(session.nodes);
}

function toDetail(
  person: FlatPerson,
  byId: Map<string, FlatPerson>,
): PersonDetail {
  return {
    id: person.id,
    fullName: person.fullName,
    jobTitle: person.jobTitle,
    department: person.department,
    country: person.country,
    avatarUrl: person.avatarUrl,
    directReports: person.directReports,
    inCycle: person.inCycle,
    isRoot: !person.managerEmploymentId,
    managerMissing: Boolean(
      person.managerEmploymentId && !byId.has(person.managerEmploymentId),
    ),
  };
}

export function PeopleWorkspace() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    () => {
      if (typeof window === "undefined") return "loading";
      if (!readRemoteConnected()) return "empty";
      return sessionPeople() ? "ready" : "loading";
    },
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [people, setPeople] = useState<FlatPerson[]>(
    () => sessionPeople() ?? [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectPerson = useCallback((id: string | null) => {
    void withViewTransition(() => {
      setSelectedId(id);
    });
  }, []);

  useEffect(() => {
    consumeReturnScrollIfMatching("/app/people");
  }, []);

  const load = useCallback(async () => {
    if (!readRemoteConnected()) {
      setStatus("empty");
      setPeople([]);
      return;
    }
    setErrorMessage(null);
    const cached = sessionPeople();
    if (cached) {
      // Dashboard / chart already warmed the session — skip the full-screen gate.
      setPeople(cached);
      setStatus("ready");
    } else {
      setStatus("loading");
    }
    try {
      const res = await fetch("/api/org-chart");
      const body = (await res.json()) as OrgChartResponse;
      if (!res.ok || !body.ok) {
        const mapped = mapOrgChartHttpError(res.status, body);
        if (cached) return;
        setStatus("error");
        setErrorMessage(mapped.message);
        return;
      }
      const nodes = body.nodes ?? [];
      if (nodes.length === 0) {
        setStatus("empty");
        setPeople([]);
        return;
      }
      setPeople(applyPersonOverrides(nodes));
      writeSessionOrgPayload(body);
      setStatus("ready");
    } catch (err) {
      if (cached) return;
      const mapped = mapOrgChartHttpError(0, {
        code: "network",
        message: err instanceof Error ? err.message : "Network error",
      });
      setStatus("error");
      setErrorMessage(mapped.message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onOverrides = () => {
      const next = sessionPeople();
      if (next) setPeople(next);
    };
    const onOrgUpdated = () => {
      void load();
    };
    window.addEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
    window.addEventListener(ORG_UPDATED_EVENT, onOrgUpdated);
    return () => {
      window.removeEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
      window.removeEventListener(ORG_UPDATED_EVENT, onOrgUpdated);
    };
  }, [load]);
  const directoryPeople: DirectoryPerson[] = useMemo(() => {
    const byId = new Map(people.map((p) => [p.id, p]));
    return people.map((p) => {
      const mgrId = p.managerEmploymentId;
      const managerName = mgrId
        ? (byId.get(mgrId)?.fullName?.trim() ?? null)
        : null;
      return { ...p, managerName };
    });
  }, [people]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    const person = people.find((p) => p.id === selectedId);
    if (!person) return null;
    const byId = new Map(people.map((p) => [p.id, p]));
    const path: PersonDetail[] = [];
    let current: string | null = selectedId;
    const guard = new Set<string>();
    while (current && !guard.has(current)) {
      guard.add(current);
      const node = byId.get(current);
      if (!node) break;
      path.push(toDetail(node, byId));
      current = node.managerEmploymentId;
    }
    path.reverse();
    const reports = people
      .filter((p) => p.managerEmploymentId === selectedId)
      .map((p) => toDetail(p, byId));
    return { person: toDetail(person, byId), pathToRoot: path, reports };
  }, [people, selectedId]);

  if (status === "loading") {
    return <ChartLoadingState />;
  }
  if (status === "error") {
    return (
      <ChartErrorState
        title="Couldn’t load people"
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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <PeopleDirectory
          people={directoryPeople}
          selectedId={selectedId}
          onSelect={selectPerson}
          onOpenInChart={(id) => {
            const search = withPersonSearchParam("", id);
            void withViewTransition(() => {
              router.push(`/app${search}`);
            });
          }}
        />
      </div>
      {selected ? (
        <PersonDetailDrawer
          placement="dock"
          person={selected.person}
          pathToRoot={selected.pathToRoot}
          reports={selected.reports}
          onClose={() => selectPerson(null)}
          onSelectPerson={selectPerson}
        />
      ) : null}
    </div>
  );
}
