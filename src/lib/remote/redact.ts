const TOKEN_LIKE =
  /\b(ra_(?:test|live)_[A-Za-z0-9_-]+|Bearer\s+[A-Za-z0-9._~+/=-]+)\b/gi;

export function redactSecrets(value: string): string {
  return value.replace(TOKEN_LIKE, "[REDACTED]");
}

export type RemoteErrorCode =
  | "config"
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "upstream"
  | "network"
  | "unknown";

export type RemoteErrorBody = {
  ok: false;
  code: RemoteErrorCode;
  message: string;
  status?: number;
};

export function mapRemoteHttpStatus(status: number): RemoteErrorCode {
  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 429:
      return "rate_limited";
    default:
      if (status >= 500) return "upstream";
      return "unknown";
  }
}

export function toClientSafeMessage(raw: string, fallback: string): string {
  const cleaned = redactSecrets(raw).trim();
  if (!cleaned) return fallback;
  // Avoid leaking large upstream bodies
  return cleaned.length > 280 ? `${cleaned.slice(0, 277)}…` : cleaned;
}
