#!/usr/bin/env bash
# Fail if tracked files look like they contain real secrets or published demo passwords.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Paths that are allowed to mention placeholders / redaction fixtures.
ALLOW_GLOBS=(
  "src/lib/remote/redact.test.ts"
  "src/lib/security/pii-checklist.test.ts"
  "src/lib/org/sync-runs.test.ts"
  "src/lib/help/load-help.test.ts"
  "scripts/check-secrets.sh"
  "playwright.config.ts"
  ".github/workflows/playwright.yml"
)

fail=0

match_forbidden() {
  local pattern="$1"
  local label="$2"
  local hits
  hits="$(rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!.open-next/**' --glob '!.wrangler/**' --glob '!.local/**' --glob '!.env*' --glob '!test-results/**' --glob '!playwright-report/**' -e "$pattern" . || true)"
  if [[ -z "$hits" ]]; then
    return 0
  fi
  local filtered=""
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    local file="${line%%:*}"
    local allowed=0
    for g in "${ALLOW_GLOBS[@]}"; do
      if [[ "$file" == "$g" || "$file" == "./$g" ]]; then
        allowed=1
        break
      fi
    done
    if [[ $allowed -eq 0 ]]; then
      filtered+="$line"$'\n'
    fi
  done <<< "$hits"
  if [[ -n "$filtered" ]]; then
    echo "check-secrets: blocked ($label)"
    printf '%s' "$filtered"
    fail=1
  fi
}

# Old published demo password must never re-enter the tree.
match_forbidden '<scrubbed-old-demo-password>' 'published demo password'

# Real-looking sandbox tokens (allow short fixtures like ra_test_example / ra_test_ci_placeholder).
match_forbidden 'ra_test_[A-Za-z0-9_]{24,}' 'long ra_test token'
match_forbidden 'ra_live_[A-Za-z0-9_]{16,}' 'live Remote token'

# Accidental .env commits with filled values (example file is empty placeholders).
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  echo "check-secrets: .env.local must not be tracked"
  fail=1
fi

if [[ $fail -ne 0 ]]; then
  echo "check-secrets: failed. Remove secrets from the commit (rotate if they leaked)."
  exit 1
fi

echo "check-secrets: ok"
