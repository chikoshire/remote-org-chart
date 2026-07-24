"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type MarketingRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms once visible */
  delayMs?: number;
};

/**
 * Scroll-triggered rise - mirrors remote.com section entrances without a motion library.
 */
export function MarketingReveal({
  children,
  className = "",
  delayMs = 0,
}: MarketingRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined = delayMs
    ? { ["--marketing-reveal-delay" as string]: `${delayMs}ms` }
    : undefined;

  return (
    <div
      ref={ref}
      className={`marketing-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
