import type { ReactNode } from "react";

type SurfaceProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function OrgSkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4"
    >
      <div className="h-16 w-44 animate-pulse rounded-norma-lg bg-norma-surface-muted shadow-norma-sm" />
      <div className="h-px w-24 bg-norma-border" />
      <div className="flex flex-wrap justify-center gap-3">
        <div className="h-14 w-36 animate-pulse rounded-norma-lg bg-norma-surface-muted delay-75" />
        <div className="h-14 w-36 animate-pulse rounded-norma-lg bg-norma-surface-muted delay-100" />
        <div className="h-14 w-36 animate-pulse rounded-norma-lg bg-norma-surface-muted delay-150" />
      </div>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 88"
      className="h-16 w-auto text-norma-royal"
      fill="none"
    >
      <rect
        x="36"
        y="8"
        width="48"
        height="28"
        rx="8"
        className="fill-norma-accent-soft stroke-norma-royal/40"
        strokeWidth="1.5"
      />
      <path
        d="M60 36v12"
        className="stroke-norma-royal/50"
        strokeWidth="1.5"
      />
      <path
        d="M32 60h56"
        className="stroke-norma-royal/35"
        strokeWidth="1.5"
      />
      <rect
        x="12"
        y="60"
        width="36"
        height="22"
        rx="6"
        className="fill-norma-surface-muted stroke-norma-border"
        strokeWidth="1.5"
      />
      <rect
        x="72"
        y="60"
        width="36"
        height="22"
        rx="6"
        className="fill-norma-surface-muted stroke-norma-border"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ChartLoadingState({
  title = "Loading organization…",
  description = "Getting the latest people and reporting lines from Remote.",
}: Partial<SurfaceProps>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,rgb(232_93_4/0.06),transparent_55%)] px-6 py-10 text-center"
    >
      <OrgSkeleton />
      <div className="max-w-md">
        <h2 className="font-[family-name:var(--font-norma-display)] text-lg font-semibold tracking-tight text-norma-prussian">
          {title}
        </h2>
        <p className="mt-1 text-sm text-norma-ink-muted">{description}</p>
      </div>
    </div>
  );
}

export function ChartEmptyState({
  title = "No people to show",
  description = "Remote didn’t return any active people for this company. Try refreshing, or check your Remote connection in Settings.",
  action,
}: Partial<SurfaceProps>) {
  return (
    <div
      role="status"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <EmptyIllustration />
      <div className="max-w-md">
        <h2 className="font-[family-name:var(--font-norma-display)] text-base font-semibold text-norma-prussian">
          {title}
        </h2>
        <p className="mt-1 text-sm text-norma-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ChartErrorState({
  title = "Couldn’t load the org chart",
  description = "Something went wrong loading people from Remote. Try again in a moment.",
  action,
}: Partial<SurfaceProps>) {
  return (
    <div
      role="alert"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-norma-danger-soft text-norma-danger">
        <span aria-hidden className="text-lg font-semibold">
          !
        </span>
      </div>
      <div className="max-w-md">
        <h2 className="text-base font-semibold text-norma-prussian">{title}</h2>
        <p className="mt-1 text-sm text-norma-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function RetryButton({
  onClick,
  label = "Try again",
}: {
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 min-w-11 rounded-norma-sm bg-norma-royal px-3 py-1.5 text-sm font-medium text-norma-ink-inverse hover:bg-norma-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-norma-ring"
    >
      {label}
    </button>
  );
}
