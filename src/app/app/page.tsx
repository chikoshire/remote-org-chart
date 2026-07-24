"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { OrgChartCanvas } from "@/components/org/OrgChartCanvas";

export default function AppOrgPage() {
  return (
    <ProductShell>
      <section
        id="org-chart"
        aria-label="Organization workspace"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        tabIndex={-1}
      >
        <OrgChartCanvas />
      </section>
    </ProductShell>
  );
}
