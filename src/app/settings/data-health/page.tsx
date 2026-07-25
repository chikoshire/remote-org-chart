"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { DataHealthWorkspace } from "@/components/org/DataHealthWorkspace";

export default function SettingsDataHealthPage() {
  return (
    <ProductShell status={<span>Data Health</span>}>
      <DataHealthWorkspace />
    </ProductShell>
  );
}
