"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { SurfaceStub } from "@/components/shell/SurfaceStub";

export default function DashboardPage() {
  return (
    <ProductShell status={<span>Dashboard</span>}>
      <SurfaceStub
        title="Dashboard"
        description="Org health, headcount, and reporting insights will live here. For now, explore the Org Chart and People surfaces."
      />
    </ProductShell>
  );
}
