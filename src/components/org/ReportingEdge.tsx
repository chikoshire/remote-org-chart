"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";

export type ReportingEdgeData = {
  highlighted?: boolean;
};

export type ReportingFlowEdge = Edge<ReportingEdgeData, "reporting">;

export function ReportingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<ReportingFlowEdge>) {
  const highlighted = Boolean(data?.highlighted);
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: highlighted ? "var(--norma-royal)" : "var(--norma-border-strong)",
          strokeWidth: highlighted ? 2.5 : 1.5,
          opacity: highlighted ? 1 : 0.85,
        }}
        className={highlighted ? "reporting-edge--highlight" : "reporting-edge"}
      />
      {highlighted ? (
        <EdgeLabelRenderer>
          <span
            className="nodrag nopan pointer-events-none absolute rounded-norma-sm bg-norma-accent-soft px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-norma-royal"
            style={{
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
            }}
          >
            path
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
