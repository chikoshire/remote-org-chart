"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { DashboardWorkspace } from "@/components/org/DashboardWorkspace";

export default function DashboardPage() {
  return (
    <ProductShell status={<span>Dashboard</span>}>
      <DashboardWorkspace />
    </ProductShell>
  );
}
