"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { SurfaceStub } from "@/components/shell/SurfaceStub";

export default function DepartmentsPage() {
  return (
    <ProductShell status={<span>Departments</span>}>
      <SurfaceStub
        title="Departments"
        description="Department rollups and team structure will appear here. Filter by department on the Org Chart until this surface is ready."
      />
    </ProductShell>
  );
}
