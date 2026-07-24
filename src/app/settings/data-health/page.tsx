"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { SettingsSubnav } from "@/components/settings/SettingsSubnav";
import { DataHealthWorkspace } from "@/components/org/DataHealthWorkspace";

export default function SettingsDataHealthPage() {
  return (
    <ProductShell status={<span>Settings · Data Health</span>}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-norma-border/70 bg-white/70 px-4 py-3 backdrop-blur-sm md:px-8 lg:px-10">
          <SettingsSubnav />
        </div>
        <DataHealthWorkspace />
      </div>
    </ProductShell>
  );
}
