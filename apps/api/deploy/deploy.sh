#!/usr/bin/env bash
# Deploy bluefin-api to VPS.
# Usage: bash deploy.sh <user@host>
# Run from repo root (monorepo).
set -euo pipefail

REMOTE="${1:?usage: deploy.sh <user@host>}"
REPO_ROOT="$(git rev-parse --show-toplevel)"

echo "==> syncing source to $REMOTE:/home/bluefin/src"
ssh "$REMOTE" "mkdir -p /home/bluefin/src"
rsync -az --delete \
  --exclude target \
  --exclude "*.db" \
  "$REPO_ROOT/apps/api/" \
  "$REMOTE:/home/bluefin/src/"

echo "==> building on remote"
ssh "$REMOTE" bash <<'REMOTE'
set -euo pipefail
source /home/bluefin/.cargo/env
cd /home/bluefin/src
cargo build --release 2>&1
REMOTE

echo "==> installing binary"
ssh "$REMOTE" bash <<'REMOTE'
set -euo pipefail
sudo cp /home/bluefin/src/target/release/bluefin-api /opt/bluefin-api/bluefin-api
sudo chmod +x /opt/bluefin-api/bluefin-api
REMOTE

echo "==> running migrations"
ssh "$REMOTE" bash <<'REMOTE'
set -euo pipefail
set -a; source /opt/bluefin-api/.env; set +a
sqlite3 "${DATABASE_URL#sqlite://}" ".tables" 2>/dev/null || true
REMOTE

echo "==> restarting service"
ssh "$REMOTE" "sudo systemctl restart bluefin-api && sudo systemctl status bluefin-api --no-pager"

echo ""
echo "Deploy complete."
