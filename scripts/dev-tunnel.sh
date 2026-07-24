#!/usr/bin/env bash
# Expose local Next.js (0.0.0.0:3000) via a public HTTPS tunnel for the
# Cursor in-app browser, which cannot reach host localhost/LAN.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

cleanup() {
  if [[ -n "${TUNNEL_PID:-}" ]]; then
    kill "$TUNNEL_PID" 2>/dev/null || true
  fi
  if [[ -n "${NEXT_PID:-}" ]]; then
    kill "$NEXT_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting Next.js on http://${HOST}:${PORT} ..."
npm run dev -- --port "$PORT" --hostname "$HOST" &
NEXT_PID=$!

for i in $(seq 1 60); do
  if curl -sf -o /dev/null "http://127.0.0.1:${PORT}/"; then
    break
  fi
  if ! kill -0 "$NEXT_PID" 2>/dev/null; then
    echo "Next.js exited before becoming ready." >&2
    exit 1
  fi
  sleep 0.5
done

if ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/"; then
  echo "Next.js did not become ready on port ${PORT}." >&2
  exit 1
fi

if command -v cloudflared >/dev/null 2>&1; then
  echo "Starting cloudflared quick tunnel → localhost:${PORT} ..."
  cloudflared tunnel --url "http://127.0.0.1:${PORT}" &
  TUNNEL_PID=$!
  echo "Open the printed https://*.trycloudflare.com URL in the Cursor browser."
else
  echo "cloudflared not found; falling back to localtunnel..."
  npx --yes localtunnel --port "$PORT" &
  TUNNEL_PID=$!
  echo "Open the printed https://*.loca.lt URL (enter the host IP once if asked)."
fi

echo "Dev + tunnel running. Leave this terminal open."
wait
