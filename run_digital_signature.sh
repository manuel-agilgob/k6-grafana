#!/bin/bash
set -e

# ─── Paso 1: Inyectar variables de entorno con dotenvx ───────────────────────
eval "$(npx dotenvx run -f .env.prod --print-env 2>/dev/null || true)"

# ─── Paso 2: Pre-generar PKCS7 con Node.js ───────────────────────────────────
echo "Generando PKCS7 con Node.js..."
node src/scripts/generate-pkcs7.js

# ─── Paso 3: Correr k6 con las mismas variables ──────────────────────────────
echo "Iniciando prueba de carga k6..."
npx dotenvx run -f .env.prod -- k6 run \
    --env K6_WEB_DASHBOARD=true \
    --env K6_WEB_DASHBOARD_EXPORT=".tmp/DigitalSignature_$(date +%b%d_%H%M).html" \
    --out json=".tmp/DigitalSignature_$(date +%b%d_%H%M).json" \
    "src/tests/functionary/digital-signature.test.js" \
    --vus 5
