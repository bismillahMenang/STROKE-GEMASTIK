#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.test.yml"
PORT="${TEST_PORT:-5055}"
DB_URL="${TEST_DATABASE_URL:-postgresql://rehabtrack:rehabtrack_test@localhost:55432/rehabtrack_test}"
JWT_SECRET="${TEST_JWT_SECRET:-integration-test-secret-change-me}"
API_BASE_URL="http://localhost:${PORT}/api"
LOG_FILE="${JCODE_SCRATCH_DIR:-/tmp}/rehabtrack-integration.log"

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  docker compose -f "$COMPOSE_FILE" down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting PostgreSQL test container..."
docker compose -f "$COMPOSE_FILE" up -d --wait

cd "$ROOT_DIR/server"

echo "Applying migrations..."
DATABASE_URL="$DB_URL" npx prisma migrate deploy

echo "Seeding demo data..."
DATABASE_URL="$DB_URL" node seed.js

echo "Starting API on port $PORT..."
DATABASE_URL="$DB_URL" JWT_SECRET="$JWT_SECRET" NODE_ENV=test PORT="$PORT" \
  CORS_ORIGIN="http://localhost:5173" AUTH_RATE_LIMIT_MAX=1000 \
  node server.js > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
  echo "Server failed to start. Log:"
  cat "$LOG_FILE"
  exit 1
fi

echo "Running API smoke test..."
API_BASE_URL="$API_BASE_URL" node scripts/smokeApi.js

echo "Integration test passed."
