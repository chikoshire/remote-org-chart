type AcmeLogoProps = {
  /** Show wordmark next to the mark */
  withWordmark?: boolean;
  className?: string;
  markClassName?: string;
  /** Inverse (light mark) for dark nav */
  inverse?: boolean;
};

/**
 * Acme company mark — ascending bars (signal / growth).
 */
export function AcmeLogo({
  withWordmark = true,
  className = "",
  markClassName = "",
  inverse = false,
}: AcmeLogoProps) {
  const bar = inverse ? "#f4f7f5" : "#0b2a32";
  const accent = "#e85d04";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        aria-hidden
        viewBox="0 0 32 32"
        className={`h-8 w-8 shrink-0 ${markClassName}`}
      >
        <rect width="32" height="32" rx="6" fill={accent} />
        <rect x="6" y="18" width="3.5" height="8" rx="1" fill={bar} />
        <rect x="11.5" y="13" width="3.5" height="13" rx="1" fill={bar} />
        <rect x="17" y="8" width="3.5" height="18" rx="1" fill={bar} />
        <rect x="22.5" y="4" width="3.5" height="22" rx="1" fill={bar} />
      </svg>
      {withWordmark ? (
        <span
          className={`font-[family-name:var(--font-norma-display)] text-[15px] font-semibold uppercase tracking-[0.18em] ${
            inverse ? "text-[#f4f7f5]" : "text-norma-prussian"
          }`}
        >
          Acme
        </span>
      ) : null}
      <span className="sr-only">Acme</span>
    </span>
  );
}
