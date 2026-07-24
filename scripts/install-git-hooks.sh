#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-commit"
mkdir -p "$ROOT/.git/hooks"
cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
exec bash "$ROOT/scripts/check-secrets.sh"
EOF
chmod +x "$HOOK" "$ROOT/scripts/check-secrets.sh"
echo "Installed pre-commit secrets gate -> .git/hooks/pre-commit"
