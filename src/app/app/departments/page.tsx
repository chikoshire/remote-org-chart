"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { DepartmentsWorkspace } from "@/components/org/DepartmentsWorkspace";

export default function DepartmentsPage() {
  return (
    <ProductShell status={<span>Departments</span>}>
      <DepartmentsWorkspace />
    </ProductShell>
  );
}
