#!/usr/bin/env bash
# One-shot: subscribe Remote sandbox → live Workers receiver, store signing_key.
# Requires a company token with webhook:write / company_admin / all:write
# (read-only all:read tokens used by the app will get 403).
#
# Usage:
#   # Prefer a short-lived write token — do not replace REMOTE_API_TOKEN if it is read-only
#   REMOTE_WEBHOOK_ADMIN_TOKEN=ra_test_… ./scripts/subscribe-remote-webhook.sh
#
# Never prints the signing_key. Writes Wrangler secret + optional .env.local line.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

TOKEN="${REMOTE_WEBHOOK_ADMIN_TOKEN:-${REMOTE_API_TOKEN:-}}"
BASE="${REMOTE_API_BASE_URL:-https://gateway.remote-sandbox.com}"
URL="${REMOTE_WEBHOOK_CALLBACK_URL:-https://remote-org-chart.shirechiko.workers.dev/api/webhooks/remote}"

if [[ -z "$TOKEN" ]]; then
  echo "Missing REMOTE_WEBHOOK_ADMIN_TOKEN or REMOTE_API_TOKEN" >&2
  exit 1
fi

EVENTS_JSON='[
  "employment.details.updated",
  "employment.updated",
  "employment_company_structure_node.updated",
  "employment.onboarding.completed",
  "employment.user_status.activated",
  "employment.user_status.deactivated",
  "employment.status.updated"
]'

BODY=$(python3 - <<PY
import json
print(json.dumps({
  "url": """$URL""",
  "subscribed_events": json.loads("""$EVENTS_JSON""")
}))
PY
)

echo "POST $BASE/v1/webhook-callbacks"
echo "  url=$URL"

RESP_FILE="$(mktemp)"
KEY_FILE="$(mktemp)"
trap 'rm -f "$RESP_FILE" "$KEY_FILE"' EXIT
chmod 600 "$RESP_FILE" "$KEY_FILE"

HTTP=$(curl -sS -o "$RESP_FILE" -w '%{http_code}' \
  -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  "${BASE}/v1/webhook-callbacks")

if [[ "$HTTP" != "200" && "$HTTP" != "201" ]]; then
  echo "Subscribe failed HTTP $HTTP" >&2
  python3 -c "import pathlib; print(pathlib.Path('$RESP_FILE').read_text()[:800])" >&2
  exit 1
fi

python3 - <<PY
import json, pathlib, sys
raw = pathlib.Path("$RESP_FILE").read_text()
data = json.loads(raw)
cb = (data.get("data") or {}).get("webhook_callback") or data.get("webhook_callback") or data
key = cb.get("signing_key")
cid = cb.get("id")
if not key:
    print("No signing_key in response — aborting", file=sys.stderr)
    print(raw[:500], file=sys.stderr)
    sys.exit(1)
pathlib.Path("$KEY_FILE").write_text(key)
print(f"callback_id={cid}")
print("signing_key captured (not printed)")
PY

echo "Storing Wrangler secret REMOTE_WEBHOOK_SIGNING_KEY…"
npx wrangler secret put REMOTE_WEBHOOK_SIGNING_KEY < "$KEY_FILE"

# Local .env.local for wrangler/dev (gitignore)
if [[ -f .env.local ]]; then
  python3 - <<PY
from pathlib import Path
key = Path("$KEY_FILE").read_text().strip()
path = Path(".env.local")
lines = path.read_text().splitlines()
out, seen = [], False
for line in lines:
    if line.startswith("REMOTE_WEBHOOK_SIGNING_KEY="):
        out.append(f"REMOTE_WEBHOOK_SIGNING_KEY={key}")
        seen = True
    else:
        out.append(line)
if not seen:
    out.append(f"REMOTE_WEBHOOK_SIGNING_KEY={key}")
path.write_text("\n".join(out) + "\n")
print("Updated .env.local REMOTE_WEBHOOK_SIGNING_KEY (gitignored)")
PY
fi

echo "Done. Probe: curl -sS -X POST $URL -H 'content-type: application/json' -d '{}'"
echo "Expect invalid_signature (401) once configured — not webhook_not_configured (503)."
