"use client";

import { Suspense, type ReactNode } from "react";
import { ProductShellInner } from "@/components/shell/ProductShellInner";

type ProductShellProps = {
  children: ReactNode;
  status?: ReactNode;
};

function ShellFallback({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-norma-canvas">
      <div className="h-12 shrink-0 border-b border-norma-border bg-white md:h-14" />
      <main className="min-h-0 flex-1">{children}</main>
      <div className="h-7 shrink-0 border-t border-norma-border bg-white" />
    </div>
  );
}

/** Suspense boundary required for useSearchParams in the shell. */
export function ProductShell(props: ProductShellProps) {
  return (
    <Suspense fallback={<ShellFallback>{props.children}</ShellFallback>}>
      <ProductShellInner {...props} />
    </Suspense>
  );
}
