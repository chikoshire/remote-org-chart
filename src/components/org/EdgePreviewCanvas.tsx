"use client";

import { useCallback, useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PersonNode } from "@/components/org/PersonNode";
import { ReportingEdge } from "@/components/org/ReportingEdge";

const initialNodes: Node[] = [
  {
    id: "a",
    type: "person",
    position: { x: 120, y: 40 },
    data: {
      label: "Ada",
      fullName: "Ada Lovelace",
      jobTitle: "Chief Scientist",
      department: "R&D",
      country: "GB",
      directReports: 1,
      variant: "root",
    },
  },
  {
    id: "b",
    type: "person",
    position: { x: 40, y: 220 },
    data: {
      label: "Grace",
      fullName: "Grace Hopper",
      jobTitle: "Engineering Manager",
      department: "Engineering",
      country: "US",
      directReports: 0,
      variant: "path",
    },
  },
  {
    id: "c",
    type: "person",
    position: { x: 320, y: 220 },
    data: {
      label: "Alan",
      fullName: "Alan Turing",
      jobTitle: "Cryptographer",
      department: "Security",
      country: "GB",
      directReports: 0,
      variant: "default",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "a-b",
    source: "a",
    target: "b",
    type: "reporting",
    data: { highlighted: true },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#624DE3" },
  },
  {
    id: "a-c",
    source: "a",
    target: "c",
    type: "reporting",
    data: { highlighted: false },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#b8c3d6" },
  },
];

function EdgePreviewInner() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const nodeTypes = useMemo(() => ({ person: PersonNode }), []);
  const edgeTypes = useMemo(() => ({ reporting: ReportingEdge }), []);
  const onInit = useCallback((instance: { fitView: (o?: object) => void }) => {
    requestAnimationFrame(() => instance.fitView({ padding: 0.25 }));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={onInit}
      fitView
      minZoom={0.35}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
    >
      <Background color="#d5dce8" gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function EdgePreviewCanvas() {
  return (
    <ReactFlowProvider>
      <div className="h-[min(70vh,560px)] w-full">
        <EdgePreviewInner />
      </div>
    </ReactFlowProvider>
  );
}
