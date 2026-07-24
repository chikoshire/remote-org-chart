"use client";

import { ProductShell } from "@/components/shell/ProductShell";
import { PersonProfileView } from "@/components/org/PersonProfileView";
import { use } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PersonProfilePage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <ProductShell status={<span>Profile</span>}>
      <PersonProfileView personId={id} />
    </ProductShell>
  );
}
