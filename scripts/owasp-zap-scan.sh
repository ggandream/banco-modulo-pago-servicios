#!/bin/bash
# =============================================================================
# OWASP ZAP - Baseline Scan against the Backend API
# =============================================================================
# Prerequisites:
#   - Docker installed
#   - Backend running on localhost:3000
#
# Usage:
#   chmod +x scripts/owasp-zap-scan.sh
#   ./scripts/owasp-zap-scan.sh
#
# The report will be saved to ./zap-report.html
# =============================================================================

set -e

API_URL="${1:-http://host.docker.internal:3000}"
REPORT_NAME="zap-report.html"

echo "============================================="
echo "  OWASP ZAP - Baseline Scan"
echo "  Target: $API_URL"
echo "============================================="

# Run ZAP baseline scan
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -v "$(pwd):/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
    -t "$API_URL" \
    -r "$REPORT_NAME" \
    -l WARN \
    -I

echo ""
echo "============================================="
echo "  Scan complete!"
echo "  Report saved to: $(pwd)/$REPORT_NAME"
echo "============================================="
