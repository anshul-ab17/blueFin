#!/usr/bin/env bash
# Deploy bluefin-api to AWS EC2 instance.
# Usage: bash deploy.sh <user@host> [path/to/key.pem]
# Run from repo root (monorepo).
set -eu

REMOTE="${1:?usage: deploy.sh <user@host> [key.pem]}"
KEY="${2:-}"
REPO_ROOT="$(git rev-parse --show-toplevel)"

SSH="ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
SCP="scp -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
if [ -n "$KEY" ]; then
  SSH="ssh -i $KEY -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
  SCP="scp -i $KEY -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
fi

echo "==> syncing source to $REMOTE:/home/bluefin/src"
$SSH "$REMOTE" "sudo mkdir -p /home/bluefin/src && sudo chown -R ubuntu:ubuntu /home/bluefin/src && mkdir -p /tmp/bfdeploy"
tar -czf /tmp/bluefin-api-src.tar.gz \
  --exclude="$REPO_ROOT/apps/api/target" \
  --exclude="$REPO_ROOT/apps/api/*.db" \
  -C "$REPO_ROOT/apps/api" .
$SCP /tmp/bluefin-api-src.tar.gz "$REMOTE:/tmp/bluefin-api-src.tar.gz"
$SSH "$REMOTE" "tar -xzf /tmp/bluefin-api-src.tar.gz -C /home/bluefin/src && rm /tmp/bluefin-api-src.tar.gz"

echo "==> building on remote"
$SSH "$REMOTE" bash <<'REMOTE'
set -eu
source /home/bluefin/.cargo/env
cd /home/bluefin/src
cargo build --release 2>&1
REMOTE

echo "==> installing binary"
$SSH "$REMOTE" bash <<'REMOTE'
set -eu
sudo cp /home/bluefin/src/target/release/bluefin-api /opt/bluefin-api/bluefin-api
sudo chmod +x /opt/bluefin-api/bluefin-api
REMOTE

echo "==> running migrations"
$SSH "$REMOTE" bash <<'REMOTE'
set -eu
set -a; source /opt/bluefin-api/.env; set +a
sqlite3 "${DATABASE_URL#sqlite://}" ".tables" 2>/dev/null || true
REMOTE

echo "==> restarting service"
$SSH "$REMOTE" "sudo systemctl restart bluefin-api && sudo systemctl status bluefin-api --no-pager"

echo ""
echo "Deploy complete."
