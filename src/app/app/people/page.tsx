"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { PeopleWorkspace } from "@/components/org/PeopleWorkspace";

export default function PeoplePage() {
  return (
    <ProductShell status={<span>People</span>}>
      <PeopleWorkspace />
    </ProductShell>
  );
}
