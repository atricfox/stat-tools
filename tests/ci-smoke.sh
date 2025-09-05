#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}

echo "Running CI smoke tests against $BASE_URL"

echo "Checking /health"
if ! curl -fsS "$BASE_URL/health" >/dev/null; then
  echo "Health check failed" >&2
  exit 2
fi

echo "Testing /api/mean"
resp=$(curl -fsS -X POST "$BASE_URL/api/mean" -H 'Content-Type: application/json' -d '{"numbers":[1,2,3]}') || { echo "API mean failed" >&2; echo "$resp"; exit 3; }

echo "Smoke tests passed"
