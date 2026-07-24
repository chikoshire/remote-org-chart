"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PersonNode } from "@/components/org/PersonNode";
import { ReportingEdge } from "@/components/org/ReportingEdge";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import type { PersonNodeData } from "@/components/org/PersonNodeCard";
import type { ReportingEdgeData } from "@/components/org/ReportingEdge";
import {
  layoutOrgChart,
  pathIdsToRoot,
  type OrgChartPayloadNode,
} from "@/lib/org/layout-flow";
import {
  applyCollapseToForest,
  readStoredDensity,
  writeStoredDensity,
  type ChartDensity,
} from "@/lib/org/collapse";
import {
  collectFilterOptions,
  EMPTY_ORG_FILTERS,
  filterOrgForest,
  filtersAreActive,
  type OrgFilters,
} from "@/lib/org/filters";
import { computeOrgInsights } from "@/lib/org/insights";
import { OrgInsightsPanel } from "@/components/org/OrgInsightsPanel";
import { OrgFiltersBar } from "@/components/org/OrgFiltersBar";
import { SyncRunsPanel } from "@/components/org/SyncRunsPanel";
import { WebhookEventsPanel } from "@/components/org/WebhookEventsPanel";
import { OrgTreeList } from "@/components/org/OrgTreeList";
import { OrgWorldMap } from "@/components/org/OrgWorldMap";
import {
  mapOrgChartHttpError,
  warningCopy,
  warningsFromMeta,
  type ChartWarning,
} from "@/lib/org/chart-state";
import {
  PersonDetailDrawer,
  type PersonDetail,
} from "@/components/org/PersonDetailDrawer";
import { peopleFromNodes, searchPeople } from "@/lib/org/search-people";
import { personAccessibleName } from "@/lib/org/person-a11y";
import {
  expandCollapsedAncestors,
  readPersonIdFromSearch,
  resolvePersonDeepLink,
  withPersonSearchParam,
} from "@/lib/org/deep-links";
import { navigateReportingRelative } from "@/lib/org/keyboard-nav";
import {
  readLiveDefault,
  readSidePanelOpen,
  writeLiveDefault,
  writeSidePanelOpen,
} from "@/lib/ui/prefs";
import {
  clearSessionOrgPayload,
  readRemoteConnected,
  readSessionOrgPayload,
  writeSessionOrgPayload,
} from "@/lib/ui/remote-connection";
import { useRouter } from "next/navigation";
import {
  reportingRelation,
  type ReportingRelation,
} from "@/lib/org/reporting-distance";
import { MOBILE_MAX_WIDTH, useMediaQuery } from "@/lib/ui/use-media-query";
import { usePrefersReducedMotion } from "@/lib/ui/use-prefers-reduced-motion";

type FlatPerson = {
  id: string;
  fullName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  managerEmploymentId: string | null;
  directReports?: number;
  inCycle?: boolean;
};

type OrgChartResponse = {
  ok: boolean;
  nodeCount: number;
  rootCount: number;
  cycleCount: number;
  orphanManagerCount: number;
  roots: OrgChartPayloadNode[];
  nodes: FlatPerson[];
  message?: string;
  code?: string;
  lastSyncedAt?: string;
  cached?: boolean;
  source?: "cache" | "remote";
};

function toDetail(
  id: string,
  byId: Map<string, FlatPerson>,
  nodeData?: PersonNodeData,
): PersonDetail {
  const flat = byId.get(id);
  return {
    id,
    fullName: nodeData?.fullName ?? flat?.fullName ?? null,
    jobTitle: nodeData?.jobTitle ?? flat?.jobTitle ?? null,
    department: nodeData?.department ?? flat?.department ?? null,
    country: nodeData?.country ?? flat?.country ?? null,
    avatarUrl: nodeData?.avatarUrl ?? flat?.avatarUrl ?? null,
    directReports: nodeData?.directReports ?? flat?.directReports ?? 0,
    inCycle: nodeData?.inCycle ?? flat?.inCycle ?? false,
    isRoot: !flat?.managerEmploymentId,
    managerMissing: Boolean(
      flat?.managerEmploymentId && !byId.has(flat.managerEmploymentId),
    ),
  };
}

function pathDetailsToRoot(
  selectedId: string,
  byId: Map<string, FlatPerson>,
  nodesById: Map<string, PersonNodeData>,
): PersonDetail[] {
  const ids: string[] = [];
  let current: string | null = selectedId;
  const guard = new Set<string>();
  while (current && !guard.has(current)) {
    guard.add(current);
    ids.push(current);
    current = byId.get(current)?.managerEmploymentId ?? null;
  }
  return ids
    .reverse()
    .map((id) => toDetail(id, byId, nodesById.get(id)));
}

const nodeTypes = { person: PersonNode };
const edgeTypes = { reporting: ReportingEdge };

function applySelection(
  nodes: Node<PersonNodeData>[],
  edges: Edge<ReportingEdgeData>[],
  selectedId: string | null,
  managerIndex: Map<string, { id: string; managerEmploymentId: string | null }>,
  options?: {
    highlightIds?: Set<string> | null;
    secondaryId?: string | null;
  },
): { nodes: Node<PersonNodeData>[]; edges: Edge<ReportingEdgeData>[] } {
  const isRoot = (id: string) =>
    !managerIndex.get(id)?.managerEmploymentId;
  const secondaryId = options?.secondaryId ?? null;
  const highlightIds =
    options?.highlightIds ??
    (selectedId ? pathIdsToRoot(selectedId, managerIndex) : null);

  if (!selectedId && !secondaryId && !highlightIds?.size) {
    return {
      nodes: nodes.map((n) => {
        const variant: PersonNodeData["variant"] = isRoot(n.id)
          ? "root"
          : "default";
        const data = { ...n.data, variant };
        return {
          ...n,
          selected: false,
          ariaLabel: personAccessibleName(data),
          data,
        };
      }),
      edges: edges.map((e) => ({
        ...e,
        data: { ...e.data, highlighted: false },
      })),
    };
  }

  const path = highlightIds ?? new Set<string>();
  return {
    nodes: nodes.map((n) => {
      const onPath = path.has(n.id);
      const isSelected = n.id === selectedId || n.id === secondaryId;
      let variant: PersonNodeData["variant"] = "default";
      if (isRoot(n.id) && !onPath) variant = "root";
      if (onPath) variant = isSelected ? "selected" : "path";
      if (isRoot(n.id) && onPath && !isSelected) variant = "path";
      if (isRoot(n.id) && isSelected) variant = "selected";
      const data = { ...n.data, variant };
      return {
        ...n,
        selected: isSelected,
        ariaLabel: personAccessibleName(data),
        data,
      };
    }),
    edges: edges.map((e) => ({
      ...e,
      data: {
        ...e.data,
        highlighted: path.has(e.source) && path.has(e.target),
      },
    })),
  };
}


function collapseManagersBeyondDepthOne(
  roots: OrgChartPayloadNode[],
): Set<string> {
  const collapsed = new Set<string>();
  const walk = (node: OrgChartPayloadNode, depth: number) => {
    const kids = node.children ?? [];
    if (depth >= 1 && kids.length > 0) collapsed.add(node.id);
    for (const child of kids) walk(child, depth + 1);
  };
  for (const root of roots) {
    for (const child of root.children ?? []) walk(child, 1);
  }
  return collapsed;
}

function OrgChartInner() {
  const isMobile = useMediaQuery(MOBILE_MAX_WIDTH);
  const reducedMotion = usePrefersReducedMotion();
  const { fitView } = useReactFlow();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorRetryable, setErrorRetryable] = useState(true);
  const [warnings, setWarnings] = useState<ChartWarning[]>([]);
  const [meta, setMeta] = useState({
    nodeCount: 0,
    rootCount: 0,
    cycleCount: 0,
    orphanManagerCount: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [peopleIndex, setPeopleIndex] = useState(
    () => new Map<string, FlatPerson>(),
  );
  const [managerIndex, setManagerIndex] = useState(
    () => new Map<string, { id: string; managerEmploymentId: string | null }>(),
  );
  const [forestRoots, setForestRoots] = useState<OrgChartPayloadNode[]>([]);
  const [density, setDensity] = useState<ChartDensity>("comfortable");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [filters, setFilters] = useState<OrgFilters>(EMPTY_ORG_FILTERS);
  const [baseNodes, setBaseNodes] = useState<Node<PersonNodeData>[]>([]);
  const [baseEdges, setBaseEdges] = useState<Edge<ReportingEdgeData>[]>([]);
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);
  const [urlSyncReady, setUrlSyncReady] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [syncLogOpen, setSyncLogOpen] = useState(false);
  const [syncLogToken, setSyncLogToken] = useState(0);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [eventsToken, setEventsToken] = useState(0);
  const [liveUpdates, setLiveUpdates] = useState(() => readLiveDefault());
  const [sidePanelOpen, setSidePanelOpen] = useState(() => readSidePanelOpen());
  const [remoteConnected, setRemoteConnected] = useState(true);
  const [viewMode, setViewMode] = useState<"chart" | "tree" | "map">("chart");
  const router = useRouter();
  const initialFitDone = useRef(false);
  const hasReadyData = useRef(false);
  const pendingDeepLinkId = useRef<string | null>(null);
  const deepLinkResolved = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PersonNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<
    Edge<ReportingEdgeData>
  >([]);

  useEffect(() => {
    setDensity(readStoredDensity());
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const rebuildLayout = useCallback(
    (
      roots: OrgChartPayloadNode[],
      nextDensity: ChartDensity,
      collapsed: Set<string>,
      nextFilters: OrgFilters,
    ) => {
      const filtered = filterOrgForest(roots, nextFilters);
      const pruned = applyCollapseToForest(filtered, collapsed);
      const laid = layoutOrgChart(pruned, { density: nextDensity });
      const withHandlers = laid.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onToggleCollapse:
            n.data.directReports > 0
              ? () => toggleCollapse(n.id)
              : undefined,
        },
      }));
      setBaseNodes(withHandlers);
      setBaseEdges(laid.edges);
    },
    [toggleCollapse],
  );

  const setDensityPreference = useCallback((next: ChartDensity) => {
    setDensity(next);
    writeStoredDensity(next);
  }, []);

  const load = useCallback(async (opts?: { refresh?: boolean; silent?: boolean }) => {
    const isRefresh = opts?.refresh === true;
    const silent = opts?.silent === true;
    setRefreshError(null);
    if (!readRemoteConnected()) {
      setRemoteConnected(false);
      setStatus("empty");
      setForestRoots([]);
      hasReadyData.current = false;
      return;
    }
    setRemoteConnected(true);
    if (isRefresh) {
      setRefreshing(true);
    } else if (!silent) {
      setStatus("loading");
      setErrorMessage(null);
      setErrorRetryable(true);
      setWarnings([]);
      setSelectedId(null);
      setDeepLinkError(null);
      setUrlSyncReady(false);
      deepLinkResolved.current = false;
      pendingDeepLinkId.current = null;
      setCompareMode(false);
      setCompareA(null);
      setCompareB(null);
      setCollapsedIds(new Set());
      setFilters(EMPTY_ORG_FILTERS);
      hasReadyData.current = false;
      setLastSyncedAt(null);
      setFromCache(false);
    }
    try {
      const res = await fetch(
        isRefresh ? "/api/org-chart?refresh=1" : "/api/org-chart",
      );
      const body = (await res.json()) as OrgChartResponse;
      if (!res.ok || !body.ok) {
        const mapped = mapOrgChartHttpError(res.status, body);
        if (isRefresh && hasReadyData.current) {
          setRefreshError(mapped.message);
          return;
        }
        setStatus("error");
        setErrorMessage(mapped.message);
        setErrorRetryable(mapped.retryable);
        return;
      }
      if (!body.roots?.length || body.nodeCount === 0) {
        if (isRefresh && hasReadyData.current) {
          setRefreshError("Remote returned an empty org chart; kept the previous snapshot.");
          return;
        }
        setStatus("empty");
        setMeta({
          nodeCount: body.nodeCount ?? 0,
          rootCount: body.rootCount ?? 0,
          cycleCount: body.cycleCount ?? 0,
          orphanManagerCount: body.orphanManagerCount ?? 0,
        });
        return;
      }
      const flatPeople = body.nodes ?? [];
      const index = new Map(
        flatPeople.map((n) => [
          n.id,
          { id: n.id, managerEmploymentId: n.managerEmploymentId },
        ]),
      );
      const people = new Map(flatPeople.map((n) => [n.id, n]));
      const nextMeta = {
        nodeCount: body.nodeCount,
        rootCount: body.rootCount,
        cycleCount: body.cycleCount,
        orphanManagerCount: body.orphanManagerCount,
      };
      setManagerIndex(index);
      setPeopleIndex(people);
      setForestRoots(body.roots);
      setMeta(nextMeta);
      setWarnings(warningsFromMeta(nextMeta));
      setLastSyncedAt(body.lastSyncedAt ?? new Date().toISOString());
      setFromCache(body.cached === true || body.source === "cache");
      hasReadyData.current = true;
      setStatus("ready");
      writeSessionOrgPayload(body);
      if (!isRefresh && !silent) {
        setCollapsedIds(collapseManagersBeyondDepthOne(body.roots));
        initialFitDone.current = false;
      }
      if (isRefresh) setSyncLogToken((n) => n + 1);
    } catch (err) {
      const mapped = mapOrgChartHttpError(0, {
        code: "network",
        message: err instanceof Error ? err.message : "Network error",
      });
      if (isRefresh && hasReadyData.current) {
        setRefreshError(mapped.message);
        return;
      }
      setStatus("error");
      setErrorMessage(mapped.message);
      setErrorRetryable(mapped.retryable);
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const connected = readRemoteConnected();
    setRemoteConnected(connected);
    if (!connected) {
      setStatus("empty");
      setErrorMessage(null);
      return;
    }
    const session = readSessionOrgPayload() as OrgChartResponse | null;
    if (
      session &&
      session.ok &&
      session.roots &&
      session.roots.length > 0 &&
      (session.nodeCount ?? 0) > 0
    ) {
      const flatPeople = session.nodes ?? [];
      const index = new Map(
        flatPeople.map((n) => [
          n.id,
          { id: n.id, managerEmploymentId: n.managerEmploymentId },
        ]),
      );
      const people = new Map(flatPeople.map((n) => [n.id, n]));
      const nextMeta = {
        nodeCount: session.nodeCount,
        rootCount: session.rootCount,
        cycleCount: session.cycleCount,
        orphanManagerCount: session.orphanManagerCount,
      };
      setManagerIndex(index);
      setPeopleIndex(people);
      setForestRoots(session.roots);
      setMeta(nextMeta);
      setWarnings(warningsFromMeta(nextMeta));
      setLastSyncedAt(session.lastSyncedAt ?? null);
      setFromCache(true);
      hasReadyData.current = true;
      setCollapsedIds(collapseManagersBeyondDepthOne(session.roots));
      initialFitDone.current = false;
      setStatus("ready");
      void load({ silent: true });
      return;
    }
    void load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "directory") {
      router.replace("/app/people");
    }
  }, [router]);

  useEffect(() => {
    if (!liveUpdates || status !== "ready") return;
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    const source = new EventSource("/api/org-chart/stream");
    const onUpdated = () => {
      setEventsToken((n) => n + 1);
      setSyncLogToken((n) => n + 1);
      void load({ refresh: true });
    };
    source.addEventListener("org-updated", onUpdated);
    source.onerror = () => {
      // Browser will retry; keep Live toggle on.
    };

    return () => {
      source.removeEventListener("org-updated", onUpdated);
      source.close();
    };
  }, [liveUpdates, load, status]);

  useEffect(() => {
    if (status !== "ready" || forestRoots.length === 0) return;
    rebuildLayout(forestRoots, density, collapsedIds, filters);
  }, [collapsedIds, density, filters, forestRoots, rebuildLayout, status]);

  useEffect(() => {
    if (status !== "ready" || deepLinkResolved.current) return;
    deepLinkResolved.current = true;
    const fromUrl = readPersonIdFromSearch(window.location.search);
    const resolved = resolvePersonDeepLink(fromUrl, peopleIndex);
    if (resolved.status === "none") {
      setUrlSyncReady(true);
      return;
    }
    if (resolved.status === "missing") {
      setDeepLinkError(
        "That person link is invalid or no longer in this org chart.",
      );
      setUrlSyncReady(true);
      return;
    }
    setDeepLinkError(null);
    setFilters(EMPTY_ORG_FILTERS);
    setCollapsedIds((prev) =>
      expandCollapsedAncestors(resolved.personId, managerIndex, prev),
    );
    pendingDeepLinkId.current = resolved.personId;
  }, [managerIndex, peopleIndex, status]);

  const filterOptions = useMemo(
    () => collectFilterOptions(forestRoots),
    [forestRoots],
  );

  const filteredForest = useMemo(
    () => filterOrgForest(forestRoots, filters),
    [filters, forestRoots],
  );

  const filterEmpty =
    status === "ready" &&
    filtersAreActive(filters) &&
    filteredForest.length === 0;

  const relation = useMemo((): ReportingRelation | null => {
    if (!compareMode || !compareA || !compareB) return null;
    return reportingRelation(compareA, compareB, managerIndex);
  }, [compareA, compareB, compareMode, managerIndex]);

  useEffect(() => {
    if (status !== "ready") return;
    if (selectedId && !baseNodes.some((n) => n.id === selectedId)) {
      setSelectedId(null);
      return;
    }
    const highlightIds =
      relation?.status === "ok" ? relation.highlightIds : null;
    const secondaryId =
      compareMode && compareB ? compareB : null;
    const primaryId =
      compareMode && compareA ? compareA : selectedId;
    const next = applySelection(
      baseNodes,
      baseEdges,
      primaryId,
      managerIndex,
      { highlightIds, secondaryId },
    );
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [
    baseEdges,
    baseNodes,
    compareA,
    compareB,
    compareMode,
    managerIndex,
    relation,
    selectedId,
    setEdges,
    setNodes,
    status,
  ]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setDeepLinkError(null);
      if (compareMode) {
        if (!compareA || compareB) {
          setCompareA(node.id);
          setCompareB(null);
          setSelectedId(node.id);
          return;
        }
        if (compareA === node.id) return;
        setCompareB(node.id);
        setSelectedId(node.id);
        return;
      }
      setSelectedId((prev) => (prev === node.id ? null : node.id));
    },
    [compareA, compareB, compareMode],
  );

  const onPaneClick = useCallback(() => {
    if (compareMode) return;
    setSelectedId(null);
    setDeepLinkError(null);
  }, [compareMode]);

  const exitCompare = useCallback(() => {
    setCompareMode(false);
    setCompareA(null);
    setCompareB(null);
  }, []);

  const enterCompare = useCallback(() => {
    setCompareMode(true);
    setCompareA(selectedId);
    setCompareB(null);
    setInsightsOpen(false);
  }, [selectedId]);

  const personLabel = useCallback(
    (id: string | null) => {
      if (!id) return "Not set";
      const person = peopleIndex.get(id);
      return person?.fullName?.trim() || "Unknown person";
    },
    [peopleIndex],
  );

  const compareHint = useMemo(() => {
    if (!compareMode) return null;
    if (!compareA) return "Select the first person";
    if (!compareB) return "Select the second person";
    if (!relation) return null;
    switch (relation.status) {
      case "ok": {
        const lca =
          relation.lowestCommonManagerId === relation.personAId ||
          relation.lowestCommonManagerId === relation.personBId
            ? `${personLabel(relation.lowestCommonManagerId)} (on the path)`
            : personLabel(relation.lowestCommonManagerId);
        return `Distance ${relation.distance} · Lowest common manager: ${lca}`;
      }
      case "same":
        return "Pick two different people";
      case "disconnected":
        return "No shared manager. These people are in disconnected trees";
      case "missing":
        return "One of those people is no longer in the chart";
      default: {
        const _exhaustive: never = relation;
        return _exhaustive;
      }
    }
  }, [compareA, compareB, compareMode, personLabel, relation]);

  const suggestions = useMemo(
    () => searchPeople(peopleFromNodes(baseNodes), query),
    [baseNodes, query],
  );

  const focusPerson = useCallback(
    (id: string) => {
      setDeepLinkError(null);
      setCollapsedIds((prev) =>
        expandCollapsedAncestors(id, managerIndex, prev),
      );
      if (compareMode) {
        if (!compareA || compareB) {
          setCompareA(id);
          setCompareB(null);
        } else if (compareA !== id) {
          setCompareB(id);
        }
      }
      setSelectedId(id);
      setQuery("");
      requestAnimationFrame(() => {
        const path = pathIdsToRoot(id, managerIndex);
        void fitView({
          nodes: [...path].map((nodeId) => ({ id: nodeId })),
          padding: 0.2,
          maxZoom: 1.05,
          duration: reducedMotion ? 0 : 420,
        });
      });
    },
    [compareA, compareB, compareMode, fitView, managerIndex, reducedMotion],
  );

  useEffect(() => {
    if (relation?.status !== "ok") return;
    requestAnimationFrame(() => {
      void fitView({
        nodes: [...relation.highlightIds].map((nodeId) => ({ id: nodeId })),
        padding: 0.2,
        maxZoom: 1.05,
        duration: reducedMotion ? 0 : 420,
      });
    });
  }, [fitView, reducedMotion, relation]);

  useEffect(() => {
    if (status !== "ready" || nodes.length === 0 || initialFitDone.current) {
      return;
    }
    initialFitDone.current = true;
    requestAnimationFrame(() => {
      void fitView({
        padding: 0.28,
        maxZoom: 1.25,
        minZoom: 0.5,
        duration: reducedMotion ? 0 : 380,
      });
    });
  }, [fitView, nodes.length, reducedMotion, status]);

  useEffect(() => {
    const pending = pendingDeepLinkId.current;
    if (!pending || status !== "ready" || baseNodes.length === 0) return;
    if (!baseNodes.some((n) => n.id === pending)) return;
    pendingDeepLinkId.current = null;
    focusPerson(pending);
    setUrlSyncReady(true);
  }, [baseNodes, focusPerson, status]);

  useEffect(() => {
    if (!urlSyncReady || typeof window === "undefined") return;
    const nextSearch = withPersonSearchParam(
      window.location.search,
      selectedId,
    );
    const currentSearch = window.location.search || "";
    if (nextSearch === currentSearch) return;
    const next =
      `${window.location.pathname}${nextSearch}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  }, [selectedId, urlSyncReady]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setDeepLinkError(null);
  }, []);

  useEffect(() => {
    if (status !== "ready") return;

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (event.key === "Escape") {
        if (query) {
          setQuery("");
          return;
        }
        if (selectedId) {
          event.preventDefault();
          clearSelection();
        }
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        if (!selectedId) return;
        const orderedIds = [...baseNodes]
          .sort((a, b) =>
            (a.data.fullName ?? "").localeCompare(
              b.data.fullName ?? "",
              undefined,
              { sensitivity: "base" },
            ),
          )
          .map((n) => n.id);
        const next = navigateReportingRelative(
          selectedId,
          event.key,
          managerIndex,
          orderedIds,
        );
        if (!next) return;
        event.preventDefault();
        focusPerson(next);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    baseNodes,
    clearSelection,
    focusPerson,
    managerIndex,
    query,
    selectedId,
    status,
  ]);

  const selectedDetail = useMemo(() => {
    if (!selectedId) return null;
    const node = baseNodes.find((n) => n.id === selectedId);
    if (!node) return null;
    const nodesById = new Map(
      baseNodes.map((n) => [n.id, n.data] as const),
    );
    const person = toDetail(selectedId, peopleIndex, node.data);
    const pathToRoot = pathDetailsToRoot(selectedId, peopleIndex, nodesById);
    const reports = baseNodes
      .filter((n) => peopleIndex.get(n.id)?.managerEmploymentId === selectedId)
      .map((n) => toDetail(n.id, peopleIndex, n.data))
      .sort((a, b) =>
        (a.fullName ?? "").localeCompare(b.fullName ?? "", undefined, {
          sensitivity: "base",
        }),
      );
    return { person, pathToRoot, reports };
  }, [baseNodes, peopleIndex, selectedId]);

  const insights = useMemo(
    () =>
      computeOrgInsights(
        applyCollapseToForest(filteredForest, collapsedIds),
      ),
    [collapsedIds, filteredForest],
  );

  const statusLabel = useMemo(() => {
    if (status === "loading") return "Loading org chart…";
    if (status === "error") return "Org chart error";
    if (status === "empty") return "Empty org chart";
    const synced = lastSyncedAt
      ? ` · updated ${new Date(lastSyncedAt).toLocaleString()}`
      : "";
    return `${meta.nodeCount} people · ${meta.rootCount} teams${
      selectedId ? " · path highlighted" : ""
    }${synced}${refreshing ? " · refreshing…" : ""}`;
  }, [
    lastSyncedAt,
    meta,
    refreshing,
    selectedId,
    status,
  ]);

  const personDrawer =
    selectedDetail && !compareMode ? (
      <PersonDetailDrawer
        person={selectedDetail.person}
        pathToRoot={selectedDetail.pathToRoot}
        reports={selectedDetail.reports}
        onClose={clearSelection}
        onSelectPerson={focusPerson}
      />
    ) : null;

  const dockedTools = (
    <div className="flex flex-col gap-2">
      <OrgInsightsPanel
        insights={insights}
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
      />
      <SyncRunsPanel
        open={syncLogOpen}
        onOpenChange={setSyncLogOpen}
        refreshToken={syncLogToken}
      />
      <WebhookEventsPanel
        open={eventsOpen}
        onOpenChange={setEventsOpen}
        refreshToken={eventsToken}
      />
    </div>
  );

  const setPanelOpen = (open: boolean) => {
    setSidePanelOpen(open);
    writeSidePanelOpen(open);
  };

  const statusLine = (
    <p
      role="status"
      aria-live="polite"
      className="shrink-0 border-t border-norma-border bg-norma-surface/95 px-3 py-1.5 text-[11px] text-norma-ink-muted"
    >
      {statusLabel}
      {filtersAreActive(filters) ? " · filters on" : ""}
      {isMobile
        ? " · pinch to zoom · drag to pan"
        : " · scroll to zoom · drag to pan"}
    </p>
  );

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <ChartLoadingState />
        </div>
        <p className="sr-only">{statusLabel}</p>
        {statusLine}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          <ChartEmptyState
            title={
              remoteConnected ? "No people to show" : "Remote is disconnected"
            }
            description={
              remoteConnected
                ? undefined
                : "Connect Remote in Settings to load your organization chart."
            }
            action={
              remoteConnected ? (
                <RetryButton onClick={() => void load()} />
              ) : (
                <RetryButton
                  label="Open Settings"
                  onClick={() => {
                    window.location.href = "/settings";
                  }}
                />
              )
            }
          />
        </div>
        {statusLine}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          <ChartErrorState
            description={
              errorMessage ??
              "Something went wrong loading people from Remote. Please try again."
            }
            action={
              errorRetryable ? (
                <RetryButton onClick={() => void load()} />
              ) : undefined
            }
          />
        </div>
        {statusLine}
      </div>
    );
  }

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-1 flex-col md:flex-row ${reducedMotion ? "" : "org-chart-enter"}`}
    >
      {sidePanelOpen ? (
        <aside className="flex w-full shrink-0 flex-col border-b border-norma-border bg-norma-surface md:h-full md:w-96 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2 border-b border-norma-border px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Workspace
            </p>
            <button
              type="button"
              className="rounded-norma-sm px-2 py-1 text-[11px] font-medium text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
              onClick={() => setPanelOpen(false)}
              aria-label="Hide side panel"
            >
              Hide
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-0.5 rounded-norma-md border border-norma-border bg-norma-surface-muted/60 p-1"
                role="group"
                aria-label="Org chart presentation"
              >
                <button
                  type="button"
                  aria-pressed={viewMode === "chart"}
                  className={`flex-1 rounded-norma-sm px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
                    viewMode === "chart"
                      ? "bg-[#e85d04] text-white shadow-norma-sm"
                      : "text-norma-ink-muted hover:text-norma-prussian"
                  }`}
                  onClick={() => setViewMode("chart")}
                >
                  Chart
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "tree"}
                  className={`flex-1 rounded-norma-sm px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
                    viewMode === "tree"
                      ? "bg-[#e85d04] text-white shadow-norma-sm"
                      : "text-norma-ink-muted hover:text-norma-prussian"
                  }`}
                  onClick={() => setViewMode("tree")}
                >
                  Tree
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "map"}
                  className={`flex-1 rounded-norma-sm px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
                    viewMode === "map"
                      ? "bg-[#e85d04] text-white shadow-norma-sm"
                      : "text-norma-ink-muted hover:text-norma-prussian"
                  }`}
                  onClick={() => setViewMode("map")}
                >
                  Map
                </button>
              </div>
              <button
                type="button"
                disabled={refreshing || !remoteConnected}
                className="w-full rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-xs font-medium text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian disabled:opacity-50"
                onClick={() => void load({ refresh: true })}
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <OrgFiltersBar
                filters={filters}
                departments={filterOptions.departments}
                countries={filterOptions.countries}
                jobTitles={filterOptions.jobTitles}
                onChange={setFilters}
                onReset={() => setFilters(EMPTY_ORG_FILTERS)}
              />
              <div className="flex flex-col gap-1">
                <label className="sr-only" htmlFor="org-search">
                  Search people by name or title
                </label>
                <input
                  ref={searchInputRef}
                  id="org-search"
                  type="search"
                  role="combobox"
                  aria-expanded={suggestions.length > 0}
                  aria-controls="org-search-results"
                  aria-autocomplete="list"
                  aria-haspopup="listbox"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setQuery("");
                      return;
                    }
                    if (e.key === "Enter" && suggestions[0]) {
                      e.preventDefault();
                      focusPerson(suggestions[0].id);
                    }
                  }}
                  placeholder="Filter the chart… (/)"
                  className="w-full rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2.5 text-sm text-norma-ink shadow-norma-sm outline-none focus:border-norma-royal"
                  autoComplete="off"
                />

                {suggestions.length > 0 ? (
                  <ul
                    id="org-search-results"
                    role="listbox"
                    aria-label="Matching people"
                    className="max-h-56 overflow-auto rounded-norma-md border border-norma-border bg-norma-surface py-1 shadow-norma-md"
                  >
                    {suggestions.map((person) => (
                      <li key={person.id} role="option" aria-selected={false}>
                        <button
                          type="button"
                          className="flex min-h-11 w-full flex-col items-start px-3 py-1.5 text-left hover:bg-norma-accent-soft focus-visible:bg-norma-accent-soft"
                          onClick={() => focusPerson(person.id)}
                        >
                          <span className="text-sm font-medium text-norma-prussian">
                            {person.fullName ?? "Unknown"}
                          </span>
                          <span className="text-xs text-norma-ink-muted">
                            {person.jobTitle ?? "No title"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {warnings.map((warning) => (
                <p
                  key={warning.type}
                  role="status"
                  className="rounded-norma-sm border border-norma-border bg-norma-highlight-soft/90 px-3 py-1.5 text-xs text-norma-prussian shadow-norma-sm"
                >
                  {warningCopy(warning)}
                </p>
              ))}
              {refreshError ? (
                <p
                  role="status"
                  className="rounded-norma-sm border border-norma-border bg-norma-surface px-3 py-1.5 text-xs text-norma-danger shadow-norma-sm"
                >
                  Refresh failed. Kept the previous chart. {refreshError}{" "}
                  <button
                    type="button"
                    className="font-medium text-norma-royal underline"
                    onClick={() => setRefreshError(null)}
                  >
                    Dismiss
                  </button>
                </p>
              ) : null}
              {deepLinkError ? (
                <p
                  role="status"
                  className="rounded-norma-sm border border-norma-border bg-norma-surface px-3 py-1.5 text-xs text-norma-danger shadow-norma-sm"
                >
                  {deepLinkError}{" "}
                  <button
                    type="button"
                    className="font-medium text-norma-royal underline"
                    onClick={() => {
                      setDeepLinkError(null);
                      const next = withPersonSearchParam(
                        window.location.search,
                        null,
                      );
                      window.history.replaceState(
                        null,
                        "",
                        `${window.location.pathname}${next}${window.location.hash}`,
                      );
                    }}
                  >
                    Dismiss
                  </button>
                </p>
              ) : null}
              {compareMode ? (
                <div
                  role="status"
                  className="rounded-norma-sm border border-norma-border bg-norma-surface px-3 py-2 text-xs text-norma-prussian shadow-norma-sm"
                >
                  <p className="font-medium">Reporting distance</p>
                  <p className="mt-1 text-norma-ink-muted">
                    {personLabel(compareA)}
                    {" → "}
                    {personLabel(compareB)}
                  </p>
                  <p className="mt-1">{compareHint}</p>
                </div>
              ) : (
                <div className="rounded-norma-md border border-dashed border-norma-border bg-norma-surface/80 px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-norma-ink-subtle">
                    Compare
                  </p>
                  <p className="mt-1 text-xs text-norma-ink-muted">
                    Pick two people on the chart to see reporting distance.
                  </p>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-norma-sm border border-norma-border bg-norma-surface px-2.5 py-2 text-left text-[11px] font-semibold text-norma-prussian shadow-norma-sm hover:border-norma-royal"
                    onClick={() => enterCompare()}
                  >
                    Start compare
                  </button>
                </div>
              )}
              <details className="rounded-norma-md border border-norma-border bg-norma-surface-muted/50 px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
                  Tools
                </summary>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    aria-pressed={liveUpdates}
                    className={`rounded-norma-sm border px-2 py-1.5 text-left text-[11px] font-medium ${
                      liveUpdates
                        ? "border-norma-royal bg-norma-accent-soft text-norma-royal"
                        : "border-norma-border bg-norma-surface text-norma-ink-muted hover:text-norma-prussian"
                    }`}
                    onClick={() => {
                      setLiveUpdates((v) => {
                        const next = !v;
                        writeLiveDefault(next);
                        return next;
                      });
                    }}
                  >
                    {liveUpdates ? "Live updates on" : "Live updates off"}
                  </button>
                  {compareMode ? (
                    <button
                      type="button"
                      aria-pressed
                      className="rounded-norma-sm border border-norma-royal bg-norma-accent-soft px-2 py-1.5 text-left text-[11px] font-medium text-norma-royal"
                      onClick={() => exitCompare()}
                    >
                      Exit compare mode
                    </button>
                  ) : null}
                  <div
                    className="flex flex-wrap gap-1"
                    role="group"
                    aria-label="Node density"
                  >
                    <button
                      type="button"
                      aria-pressed={density === "comfortable"}
                      className={`rounded-norma-sm px-2 py-1 text-[11px] font-medium ${
                        density === "comfortable"
                          ? "bg-norma-accent-soft text-norma-royal"
                          : "border border-norma-border text-norma-ink-muted hover:text-norma-prussian"
                      }`}
                      onClick={() => setDensityPreference("comfortable")}
                    >
                      Comfortable
                    </button>
                    <button
                      type="button"
                      aria-pressed={density === "compact"}
                      className={`rounded-norma-sm px-2 py-1 text-[11px] font-medium ${
                        density === "compact"
                          ? "bg-norma-accent-soft text-norma-royal"
                          : "border border-norma-border text-norma-ink-muted hover:text-norma-prussian"
                      }`}
                      onClick={() => setDensityPreference("compact")}
                    >
                      Compact
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-pressed={syncLogOpen}
                    className={`rounded-norma-sm border px-2 py-1.5 text-left text-[11px] font-medium ${
                      syncLogOpen
                        ? "border-norma-royal bg-norma-accent-soft text-norma-royal"
                        : "border-norma-border bg-norma-surface text-norma-ink-muted hover:text-norma-prussian"
                    }`}
                    onClick={() => setSyncLogOpen((v) => !v)}
                  >
                    {syncLogOpen ? "Hide sync log" : "Show sync log"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={eventsOpen}
                    className={`rounded-norma-sm border px-2 py-1.5 text-left text-[11px] font-medium ${
                      eventsOpen
                        ? "border-norma-royal bg-norma-accent-soft text-norma-royal"
                        : "border-norma-border bg-norma-surface text-norma-ink-muted hover:text-norma-prussian"
                    }`}
                    onClick={() => setEventsOpen((v) => !v)}
                  >
                    {eventsOpen ? "Hide webhook events" : "Show webhook events"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={insightsOpen}
                    className={`rounded-norma-sm border px-2 py-1.5 text-left text-[11px] font-medium ${
                      insightsOpen
                        ? "border-norma-royal bg-norma-accent-soft text-norma-royal"
                        : "border-norma-border bg-norma-surface text-norma-ink-muted hover:text-norma-prussian"
                    }`}
                    onClick={() => setInsightsOpen((v) => !v)}
                  >
                    {insightsOpen ? "Hide org insights" : "Show org insights"}
                  </button>
                </div>
              </details>
              {dockedTools}
            </div>
          </div>
        </aside>
      ) : null}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {!sidePanelOpen ? (
          <button
            type="button"
            className="absolute left-3 top-3 z-20 rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-xs font-semibold text-norma-prussian shadow-norma-md hover:border-norma-royal"
            onClick={() => setPanelOpen(true)}
          >
            Show panel
          </button>
        ) : null}
        <div className="relative min-h-0 flex-1">
          {filterEmpty ? (
            <ChartEmptyState
              title="No people match these filters"
              description="Ancestors stay when they connect a match to the root. Reset filters to see the full Acme org again."
              action={
                <RetryButton
                  label="Reset filters"
                  onClick={() => setFilters(EMPTY_ORG_FILTERS)}
                />
              }
            />
          ) : viewMode === "tree" ? (
            <OrgTreeList
              roots={filteredForest}
              selectedId={selectedId}
              onSelect={focusPerson}
            />
          ) : viewMode === "map" ? (
            <OrgWorldMap
              people={Array.from(peopleIndex.values()).map((p) => ({
                id: p.id,
                fullName: p.fullName ?? null,
                jobTitle: p.jobTitle ?? null,
                department: p.department ?? null,
                country: p.country ?? null,
                avatarUrl: p.avatarUrl ?? null,
              }))}
              selectedId={selectedId}
              onSelect={focusPerson}
            />
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              fitView={false}
              minZoom={0.15}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
              nodesConnectable={false}
              nodesFocusable
              edgesFocusable={false}
              deleteKeyCode={null}
              // Scroll = zoom (Map parity). Drag pans; trackpad pinch still zooms.
              panOnScroll={false}
              panOnDrag
              zoomOnScroll
              zoomOnPinch
              zoomOnDoubleClick={!isMobile}
              selectionOnDrag={false}
              preventScrolling
              className="h-full w-full bg-transparent"
              aria-label="Interactive organization chart. Scroll to zoom, drag to pan, plus and minus to zoom, Enter on a focused person to highlight their reporting path."
            >
              <Background color="#d7e0e3" gap={isMobile ? 18 : 24} size={1.1} />
              <Controls
                showInteractive={false}
                position={isMobile ? "bottom-right" : "bottom-left"}
                className={isMobile ? "!m-2" : undefined}
                aria-label="Chart zoom controls"
              />
              {!isMobile ? (
                <MiniMap
                  pannable
                  zoomable
                  nodeColor={() => "#e85d04"}
                  maskColor="rgb(26 26 26 / 0.08)"
                  aria-label="Organization chart overview map"
                />
              ) : null}
            </ReactFlow>
          )}
          {personDrawer}
        </div>
        {statusLine}
      </div>
    </div>
  );
}

export function OrgChartCanvas() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col">
        <OrgChartInner />
      </div>
    </ReactFlowProvider>
  );
}
