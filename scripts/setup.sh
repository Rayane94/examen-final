#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  echo "Fichier .env déjà présent : aucune modification."
  exit 0
fi
if ! command -v openssl >/dev/null; then
  echo 'openssl requis pour générer les secrets.' >&2
  exit 1
fi
(umask 077; cat > .env <<VARS
JWT_SECRET=$(openssl rand -hex 32)
INTERNAL_SERVICE_TOKEN=$(openssl rand -hex 32)
NOTIFICATION_EMAIL=
MAIL_MODE=disabled
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
VARS
)
echo 'Configuration locale .env créée. Ne jamais la committer.'
