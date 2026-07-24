"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { DataHealthWorkspace } from "@/components/org/DataHealthWorkspace";

export default function DataHealthPage() {
  return (
    <ProductShell status={<span>Data Health</span>}>
      <DataHealthWorkspace />
    </ProductShell>
  );
}
