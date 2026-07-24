"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  PersonNodeCard,
  type PersonNodeData,
  type PersonNodeVariant,
} from "@/components/org/PersonNodeCard";

type PersonData = PersonNodeData & Record<string, unknown>;

export function PersonNode({ data, selected, id }: NodeProps) {
  const person = data as PersonData;
  const variant: PersonNodeVariant =
    person.variant ?? (selected ? "selected" : "default");

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} />
      <PersonNodeCard
        fullName={person.fullName ?? null}
        jobTitle={person.jobTitle ?? null}
        department={person.department ?? null}
        country={person.country ?? null}
        directReports={person.directReports ?? 0}
        inCycle={Boolean(person.inCycle)}
        variant={variant}
        density={person.density}
        collapsed={person.collapsed}
        collapsedCount={person.collapsedCount}
        onToggleCollapse={person.onToggleCollapse}
      />
      <Handle type="source" position={Position.Bottom} />
      {/* id kept for React Flow focus targeting */}
      <span className="sr-only">{id}</span>
    </div>
  );
}
