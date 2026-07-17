#!/usr/bin/env bash
# One-time VPS setup. Run as root on a fresh Ubuntu 24.04 Hetzner VPS.
# Usage: bash setup.sh <your-domain.com>
set -euo pipefail

DOMAIN="${1:?usage: setup.sh <domain>}"
API_USER="bluefin"

# --- system deps ---
apt-get update -qq
apt-get install -y --no-install-recommends \
  build-essential curl git nginx certbot python3-certbot-nginx \
  pkg-config libssl-dev sqlite3

# --- unprivileged user ---
id -u "$API_USER" &>/dev/null || useradd -m -s /bin/bash "$API_USER"

# --- Rust (for that user) ---
sudo -u "$API_USER" bash -c \
  'curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable'

# --- app directories ---
mkdir -p /opt/bluefin-api
chown "$API_USER:$API_USER" /opt/bluefin-api

# --- nginx site ---
cat > /etc/nginx/sites-available/bluefin-api <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass         http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_read_timeout 86400;
        # SSE: disable buffering
        proxy_buffering    off;
        proxy_cache        off;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/bluefin-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --- TLS ---
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

# --- .env stub (fill in secrets after setup) ---
cat > /opt/bluefin-api/.env <<'ENV'
BIND_ADDR=127.0.0.1:8787
DATABASE_URL=sqlite:///opt/bluefin-api/bluefin.db?mode=rwc
TXLINE_BASE_URL=https://txline-dev.txodds.com
TXLINE_JWT=FILL_ME
TXLINE_API_TOKEN=FILL_ME
ENV
chown "$API_USER:$API_USER" /opt/bluefin-api/.env
chmod 600 /opt/bluefin-api/.env

# --- systemd unit ---
cat > /etc/systemd/system/bluefin-api.service <<UNIT
[Unit]
Description=bluefin-api
After=network.target

[Service]
Type=simple
User=$API_USER
WorkingDirectory=/opt/bluefin-api
EnvironmentFile=/opt/bluefin-api/.env
ExecStart=/opt/bluefin-api/bluefin-api
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable bluefin-api

echo ""
echo "Setup done. Next:"
echo "  1. Edit /opt/bluefin-api/.env — fill TXLINE_JWT and TXLINE_API_TOKEN"
echo "  2. Run deploy.sh to build and start the service"
