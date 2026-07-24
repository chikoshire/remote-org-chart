"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { SurfaceStub } from "@/components/shell/SurfaceStub";

export default function PeoplePage() {
  return (
    <ProductShell status={<span>People</span>}>
      <SurfaceStub
        title="People"
        description="Search and browse everyone in the company from this directory. The full people list ships next; use Org Chart search and profiles in the meantime."
      />
    </ProductShell>
  );
}
