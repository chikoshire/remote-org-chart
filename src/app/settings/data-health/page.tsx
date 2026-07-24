"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { SettingsChrome } from "@/components/settings/SettingsChrome";
import { DataHealthWorkspace } from "@/components/org/DataHealthWorkspace";

export default function SettingsDataHealthPage() {
  return (
    <ProductShell status={<span>Settings · Data Health</span>}>
      <SettingsChrome>
        <DataHealthWorkspace />
      </SettingsChrome>
    </ProductShell>
  );
}
