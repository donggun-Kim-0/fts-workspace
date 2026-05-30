#!/usr/bin/env bash
# Cloudflare Tunnel + Next.js production — 외부 공유용 (HMR WebSocket 502 방지)
set -euo pipefail

FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-4000}"

if ! curl -sf "http://127.0.0.1:${BACKEND_PORT}/" >/dev/null 2>&1; then
  echo "❌ 백엔드(http://127.0.0.1:${BACKEND_PORT})가 실행 중이 아닙니다."
  echo "   cd backend && npm run start:dev"
  exit 1
fi

cd "$(dirname "$0")/../frontend"

echo "▶ Next.js production 빌드..."
npm run build

fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null || true
sleep 1

echo "▶ Next.js production 서버 시작 (port ${FRONTEND_PORT})..."
PORT="${FRONTEND_PORT}" npm run start &
NEXT_PID=$!
trap 'kill $NEXT_PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

bash "$(dirname "$0")/expose-dev.sh"
