#!/bin/bash

APP_URL="http://localhost:8080"
LOGIN_URL="http://localhost:8080/api/auth/login"
USERNAME="juan.perez"
PASSWORD="user123"

# Paso 1 - Obtener JWT
echo "Haciendo login..."
TOKEN=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token"
  exit 1
fi
echo "Token obtenido: ${TOKEN:0:20}..."

# Paso 2 - Correr ZAP con hook + AJAX spider
echo "Iniciando escaneo ZAP..."
docker run --network host \
  -v "$(pwd)":/zap/wrk:rw \
  -t ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
  -t "$APP_URL" \
  -r reporte.html \
  -j \
  --hook /zap/wrk/add_urls.py \
  -z "-config replacer.full_list(0).description=auth \
      -config replacer.full_list(0).enabled=true \
      -config replacer.full_list(0).matchtype=REQ_HEADER \
      -config replacer.full_list(0).matchstr=Authorization \
      -config replacer.full_list(0).replacement=Bearer\ ${TOKEN}"

echo "Escaneo finalizado. Revisa reporte.html"