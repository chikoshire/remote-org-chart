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
          "Remote API token is missing or invalid on the server. Check .env.local — never put tokens in the browser.",
        retryable: false,
      };
    case "unauthorized":
    case "forbidden":
      return {
        kind: "error",
        code,
        message:
          "Remote sandbox rejected the token. Confirm the read-only sandbox key still works, then retry.",
        retryable: true,
      };
    case "rate_limited":
      return {
        kind: "error",
        code,
        message: "Remote rate-limited this request. Wait a moment and retry.",
        retryable: true,
      };
    case "upstream":
    case "network":
      return {
        kind: "error",
        code,
        message:
          body.message ??
          "Could not reach gateway.remote-sandbox.com. Retry when the network is stable.",
        retryable: true,
      };
    default:
      return {
        kind: "error",
        code,
        message:
          body.message ??
          `Org chart request failed (${status}). Retry or check /api/health/remote.`,
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
      return `${warning.count} employment${warning.count === 1 ? "" : "s"} sit on a reporting cycle — marked on their cards.`;
    case "orphan_managers":
      return `${warning.count} manager id${warning.count === 1 ? "" : "s"} referenced but missing from the active set.`;
    default: {
      const _exhaustive: never = warning;
      return _exhaustive;
    }
  }
}
