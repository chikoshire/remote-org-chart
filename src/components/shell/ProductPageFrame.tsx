import type { ReactNode } from "react";

type ProductPageFrameProps = {
  children: ReactNode;
  /** Optional class on the outer scroll container */
  className?: string;
};

/**
 * Full-bleed product content frame — consistent horizontal padding, no narrow max-width.
 * Use for Dashboard, Preferences, Data Health, and similar scrolled surfaces.
 */
export function ProductPageFrame({
  children,
  className = "",
}: ProductPageFrameProps) {
  return (
    <div className={`min-h-0 flex-1 overflow-auto ${className}`.trim()}>
      <div className="w-full px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {children}
      </div>
    </div>
  );
}
