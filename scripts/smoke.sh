#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3000}"
echo "[1/3] Health frontend"
curl -fsS "$BASE/health"; echo
echo "[2/3] Health backend"
curl -fsS "$BASE/api/health"; echo
echo "[3/3] Liste des produits"
curl -fsS "$BASE/api/products"; echo
echo 'Sondes HTTP OK. Auth, panier, commandes, admin et mail doivent aussi être vérifiés dans le navigateur.'
