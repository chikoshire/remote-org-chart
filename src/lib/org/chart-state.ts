export type ChartUiState =
  | { kind: "loading" }
  | { kind: "ready"; warnings: ChartWarning[] }
  | { kind: "empty"; reason: string }
  | { kind: "error"; code: string; message: string; retryable: boolean };

export type ChartWarning =
  | { type: "cycles"; count: number }
  | { type: "orphan_managers"; count: number };

export function mapOrgChartHttpError(
  status: number,
  body: { code?: string; message?: string },
): Extract<ChartUiState, { kind: "error" }> {
  const code = body.code ?? `http_${status}`;
  switch (code) {
    case "missing_token":
    case "invalid_env":
      return {
        kind: "error",
        code,
        message:
          "Acme can’t reach Remote right now. Check your connection in Settings, then try again.",
        retryable: false,
      };
    case "unauthorized":
    case "forbidden":
      return {
        kind: "error",
        code,
        message:
          "Remote couldn’t authorize this connection. Ask an admin to check the Acme–Remote integration.",
        retryable: true,
      };
    case "rate_limited":
      return {
        kind: "error",
        code,
        message: "Remote is busy. Wait a moment and try again.",
        retryable: true,
      };
    case "upstream":
    case "network":
      return {
        kind: "error",
        code,
        message:
          body.message ??
          "Couldn’t reach Remote. Check your network and try again.",
        retryable: true,
      };
    default:
      return {
        kind: "error",
        code,
        message:
          body.message ??
          "Something went wrong loading the org chart. Please try again.",
        retryable: status >= 500 || status === 429,
      };
  }
}

export function warningsFromMeta(meta: {
  cycleCount: number;
  orphanManagerCount: number;
}): ChartWarning[] {
  const warnings: ChartWarning[] = [];
  if (meta.cycleCount > 0) {
    warnings.push({ type: "cycles", count: meta.cycleCount });
  }
  if (meta.orphanManagerCount > 0) {
    warnings.push({ type: "orphan_managers", count: meta.orphanManagerCount });
  }
  return warnings;
}

export function warningCopy(warning: ChartWarning): string {
  switch (warning.type) {
    case "cycles":
      return `${warning.count} employment${warning.count === 1 ? "" : "s"} sit on a reporting cycle. Marked on their cards.`;
    case "orphan_managers":
      return `${warning.count} manager id${warning.count === 1 ? "" : "s"} referenced but missing from the active set.`;
    default: {
      const _exhaustive: never = warning;
      return _exhaustive;
    }
  }
}
