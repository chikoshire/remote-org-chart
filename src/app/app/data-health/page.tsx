"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { SurfaceStub } from "@/components/shell/SurfaceStub";

export default function DataHealthPage() {
  return (
    <ProductShell status={<span>Data Health</span>}>
      <SurfaceStub
        title="Data Health"
        description="Missing managers, cycles, and incomplete records will be listed here so you can fix reporting lines with confidence."
      />
    </ProductShell>
  );
}
