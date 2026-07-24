"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  mapOrgChartHttpError,
  warningCopy,
  warningsFromMeta,
  type ChartWarning,
} from "@/lib/org/chart-state";
import { peopleFromNodes, searchPeople } from "@/lib/org/search-people";
import { personAccessibleName } from "@/lib/org/person-a11y";
import { MOBILE_MAX_WIDTH, useMediaQuery } from "@/lib/ui/use-media-query";
type OrgChartResponse = {
  ok: boolean;
  nodeCount: number;
  rootCount: number;
  cycleCount: number;
  orphanManagerCount: number;
  roots: OrgChartPayloadNode[];
  nodes: Array<{
    id: string;
    managerEmploymentId: string | null;
  }>;
  message?: string;
  code?: string;
};

const nodeTypes = { person: PersonNode };
const edgeTypes = { reporting: ReportingEdge };

function applySelection(
  nodes: Node<PersonNodeData>[],
  edges: Edge<ReportingEdgeData>[],
  selectedId: string | null,
  managerIndex: Map<string, { id: string; managerEmploymentId: string | null }>,
): { nodes: Node<PersonNodeData>[]; edges: Edge<ReportingEdgeData>[] } {
  if (!selectedId) {
    return {
      nodes: nodes.map((n) => {
        const variant: PersonNodeData["variant"] =
          n.data.variant === "root" ? "root" : "default";
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

  const path = pathIdsToRoot(selectedId, managerIndex);
  return {
    nodes: nodes.map((n) => {
      const onPath = path.has(n.id);
      const isSelected = n.id === selectedId;
      let variant: PersonNodeData["variant"] = "default";
      if (n.data.variant === "root" && !onPath) variant = "root";
      if (onPath) variant = isSelected ? "selected" : "path";
      if (n.data.variant === "root" && onPath && !isSelected) variant = "path";
      if (n.data.variant === "root" && isSelected) variant = "selected";
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

function OrgChartInner() {
  const isMobile = useMediaQuery(MOBILE_MAX_WIDTH);
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
  const [managerIndex, setManagerIndex] = useState(
    () => new Map<string, { id: string; managerEmploymentId: string | null }>(),
  );
  const [baseNodes, setBaseNodes] = useState<Node<PersonNodeData>[]>([]);
  const [baseEdges, setBaseEdges] = useState<Edge<ReportingEdgeData>[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PersonNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<
    Edge<ReportingEdgeData>
  >([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setErrorRetryable(true);
    setWarnings([]);
    setSelectedId(null);
    try {
      const res = await fetch("/api/org-chart");
      const body = (await res.json()) as OrgChartResponse;
      if (!res.ok || !body.ok) {
        const mapped = mapOrgChartHttpError(res.status, body);
        setStatus("error");
        setErrorMessage(mapped.message);
        setErrorRetryable(mapped.retryable);
        return;
      }
      if (!body.roots?.length || body.nodeCount === 0) {
        setStatus("empty");
        setMeta({
          nodeCount: body.nodeCount ?? 0,
          rootCount: body.rootCount ?? 0,
          cycleCount: body.cycleCount ?? 0,
          orphanManagerCount: body.orphanManagerCount ?? 0,
        });
        return;
      }
      const laid = layoutOrgChart(body.roots);
      const index = new Map(
        (body.nodes ?? []).map((n) => [
          n.id,
          { id: n.id, managerEmploymentId: n.managerEmploymentId },
        ]),
      );
      const nextMeta = {
        nodeCount: body.nodeCount,
        rootCount: body.rootCount,
        cycleCount: body.cycleCount,
        orphanManagerCount: body.orphanManagerCount,
      };
      setManagerIndex(index);
      setBaseNodes(laid.nodes);
      setBaseEdges(laid.edges);
      setNodes(laid.nodes);
      setEdges(laid.edges);
      setMeta(nextMeta);
      setWarnings(warningsFromMeta(nextMeta));
      setStatus("ready");
    } catch (err) {
      const mapped = mapOrgChartHttpError(0, {
        code: "network",
        message: err instanceof Error ? err.message : "Network error",
      });
      setStatus("error");
      setErrorMessage(mapped.message);
      setErrorRetryable(mapped.retryable);
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status !== "ready") return;
    const next = applySelection(baseNodes, baseEdges, selectedId, managerIndex);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [
    baseEdges,
    baseNodes,
    managerIndex,
    selectedId,
    setEdges,
    setNodes,
    status,
  ]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  const suggestions = useMemo(
    () => searchPeople(peopleFromNodes(baseNodes), query),
    [baseNodes, query],
  );

  const focusPerson = useCallback(
    (id: string) => {
      setSelectedId(id);
      setQuery("");
      requestAnimationFrame(() => {
        const path = pathIdsToRoot(id, managerIndex);
        void fitView({
          nodes: [...path].map((nodeId) => ({ id: nodeId })),
          padding: 0.35,
          duration: 400,
        });
      });
    },
    [fitView, managerIndex],
  );

  const statusLabel = useMemo(() => {
    if (status === "loading") return "Loading org chart…";
    if (status === "error") return "Org chart error";
    if (status === "empty") return "Empty org chart";
    return `${meta.nodeCount} people · ${meta.rootCount} roots · ${meta.cycleCount} cycles${
      selectedId ? " · path highlighted" : ""
    }`;
  }, [meta, selectedId, status]);

  if (status === "loading") {
    return (
      <div className="flex h-full flex-col">
        <ChartLoadingState />
        <p className="sr-only">{statusLabel}</p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <ChartEmptyState action={<RetryButton onClick={() => void load()} />} />
    );
  }

  if (status === "error") {
    return (
      <ChartErrorState
        description={
          errorMessage ??
          "The Remote API request failed. Token stays server-side — retry, or check /api/health/remote."
        }
        action={
          errorRetryable ? (
            <RetryButton onClick={() => void load()} />
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 right-3 top-3 z-20 flex flex-col gap-1 md:left-auto md:right-3 md:w-80">
        <label className="sr-only" htmlFor="org-search">
          Search people by name or title
        </label>
        <input
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
          placeholder="Search by name or title…"
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
        {warnings.map((warning) => (
          <p
            key={warning.type}
            role="status"
            className="rounded-norma-sm border border-norma-border bg-norma-highlight-soft/90 px-3 py-1.5 text-xs text-norma-prussian shadow-norma-sm"
          >
            {warningCopy(warning)}
          </p>
        ))}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: isMobile ? 0.12 : 0.2 }}
        minZoom={isMobile ? 0.08 : 0.15}
        maxZoom={1.4}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        nodesFocusable
        edgesFocusable={false}
        deleteKeyCode={null}
        panOnScroll
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={!isMobile}
        selectionOnDrag={false}
        preventScrolling
        aria-label="Interactive organization chart. Use arrow keys or drag to pan, plus and minus to zoom, Enter on a focused person to highlight their reporting path."
      >
        <Background color="#d5dce8" gap={isMobile ? 16 : 20} size={1} />
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
            nodeColor={() => "#624DE3"}
            maskColor="rgb(0 35 75 / 0.08)"
            aria-label="Organization chart overview map"
          />
        ) : null}
      </ReactFlow>
      <p
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute rounded-norma-sm bg-norma-surface/90 px-2 py-1 text-[11px] text-norma-ink-muted shadow-norma-sm ${
          isMobile ? "bottom-14 left-2 max-w-[70%]" : "bottom-3 left-3"
        }`}
      >
        {statusLabel}
        {isMobile ? " · pinch to zoom · drag to pan" : ""}
      </p>
    </div>
  );
}

export function OrgChartCanvas() {
  return (
    <ReactFlowProvider>
      <div className="h-[min(100dvh-9rem,720px)] w-full md:h-[min(78vh,720px)]">
        <OrgChartInner />
      </div>
    </ReactFlowProvider>
  );
}
