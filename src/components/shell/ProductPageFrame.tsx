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
      <div className="w-full px-5 py-8 md:px-8 md:py-10 lg:px-10 xl:px-12">
        {children}
      </div>
    </div>
  );
}
