"use client";

import type { ReactNode } from "react";
import { ProductShellInner } from "@/components/shell/ProductShellInner";

type ProductShellProps = {
  children: ReactNode;
  status?: ReactNode;
};

export function ProductShell(props: ProductShellProps) {
  return <ProductShellInner {...props} />;
}
