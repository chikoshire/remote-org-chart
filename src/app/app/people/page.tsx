"use client";

import { Suspense } from "react";
import { ProductShell } from "@/components/shell/ProductShell";
import { ChartLoadingState } from "@/components/org/ChartStateSurfaces";
import { PeopleWorkspace } from "@/components/org/PeopleWorkspace";

export default function PeoplePage() {
  return (
    <ProductShell status={<span>People</span>}>
      <Suspense fallback={<ChartLoadingState />}>
        <PeopleWorkspace />
      </Suspense>
    </ProductShell>
  );
}
