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
      nodes: nodes.map((n) => ({
        ...n,
        selected: false,
        data: {
          ...n.data,
          variant: n.data.variant === "root" ? "root" : "default",
        },
      })),
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
      return {
        ...n,
        selected: isSelected,
        data: { ...n.data, variant },
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
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    nodeCount: 0,
    rootCount: 0,
    cycleCount: 0,
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
    setSelectedId(null);
    try {
      const res = await fetch("/api/org-chart");
      const body = (await res.json()) as OrgChartResponse;
      if (!res.ok || !body.ok) {
        setStatus("error");
        setErrorMessage(body.message ?? body.code ?? `HTTP ${res.status}`);
        return;
      }
      if (!body.roots?.length || body.nodeCount === 0) {
        setStatus("empty");
        setMeta({
          nodeCount: body.nodeCount ?? 0,
          rootCount: body.rootCount ?? 0,
          cycleCount: body.cycleCount ?? 0,
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
      setManagerIndex(index);
      setBaseNodes(laid.nodes);
      setBaseEdges(laid.edges);
      setNodes(laid.nodes);
      setEdges(laid.edges);
      setMeta({
        nodeCount: body.nodeCount,
        rootCount: body.rootCount,
        cycleCount: body.cycleCount,
      });
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Network error");
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
        action={<RetryButton onClick={() => void load()} />}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={1.4}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        deleteKeyCode={null}
      >
        <Background color="#d5dce8" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => "#624DE3"}
          maskColor="rgb(0 35 75 / 0.08)"
        />
      </ReactFlow>
      <p className="pointer-events-none absolute bottom-3 left-3 rounded-norma-sm bg-norma-surface/90 px-2 py-1 text-[11px] text-norma-ink-muted shadow-norma-sm">
        {statusLabel}
      </p>
    </div>
  );
}

export function OrgChartCanvas() {
  return (
    <ReactFlowProvider>
      <div className="h-[min(78vh,720px)] w-full">
        <OrgChartInner />
      </div>
    </ReactFlowProvider>
  );
}
