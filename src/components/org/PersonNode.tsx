"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  PersonNodeCard,
  type PersonNodeData,
  type PersonNodeVariant,
} from "@/components/org/PersonNodeCard";

export type PersonFlowNode = Node<PersonNodeData, "person">;

export function PersonNode({ data, selected }: NodeProps<PersonFlowNode>) {
  const variant: PersonNodeVariant =
    data.variant ?? (selected ? "selected" : "default");

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-norma-border !bg-norma-surface"
      />
      <PersonNodeCard {...data} variant={variant} />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-norma-border !bg-norma-surface"
      />
    </div>
  );
}
