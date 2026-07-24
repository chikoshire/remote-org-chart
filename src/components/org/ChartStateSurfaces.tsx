import type { ReactNode } from "react";

type SurfaceProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ChartLoadingState({
  title = "Loading organization…",
  description = "Getting the latest people and reporting lines from Remote.",
}: Partial<SurfaceProps>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgb(232_93_4/0.08),transparent_55%)] px-6 text-center"
    >
      <span
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#0b2a32]/20 border-t-[#e85d04]"
      />
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
