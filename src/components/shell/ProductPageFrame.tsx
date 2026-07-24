import type { ReactNode } from "react";

type ProductPageFrameProps = {
  children: ReactNode;
  /** Optional class on the outer scroll container */
  className?: string;
};

/**
 * Full-bleed product content frame - consistent horizontal padding, no narrow max-width.
 * Use for Dashboard, Preferences, Data Health, and similar scrolled surfaces.
 */
export function ProductPageFrame({
  children,
  className = "",
}: ProductPageFrameProps) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-auto ${className}`.trim()}
      data-product-scroll
    >
      <div className="w-full px-5 py-10 md:px-10 md:py-12 lg:px-12 xl:px-14">
        {children}
      </div>
    </div>
  );
}
