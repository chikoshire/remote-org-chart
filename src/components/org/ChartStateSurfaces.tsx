import type { ReactNode } from "react";

type SurfaceProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ChartLoadingState({
  title = "Loading organization…",
  description = "Fetching employments from Remote sandbox and building the reporting tree.",
}: Partial<SurfaceProps>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <span
        aria-hidden
        className="h-9 w-9 animate-spin rounded-full border-2 border-norma-border border-t-norma-royal"
      />
      <div className="max-w-md">
        <h2 className="text-base font-semibold text-norma-prussian">{title}</h2>
        <p className="mt-1 text-sm text-norma-ink-muted">{description}</p>
      </div>
    </div>
  );
}

export function ChartEmptyState({
  title = "No people to chart",
  description = "Remote returned no active employments for this company. Check sandbox data or status filters.",
  action,
}: Partial<SurfaceProps>) {
  return (
    <div
      role="status"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-norma-accent-soft text-norma-royal">
        <span aria-hidden className="text-lg font-semibold">
          ∅
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

export function ChartErrorState({
  title = "Couldn’t load the org chart",
  description = "The Remote API request failed. Token stays server-side — retry, or check /api/health/remote.",
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
