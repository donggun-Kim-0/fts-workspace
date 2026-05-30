#!/usr/bin/env bash
# 로컬 dev 서버를 Cloudflare Tunnel로 공개 — 다른 PC·모바일에서 접속
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-4000}"
CLOUDFLARED="${CLOUDFLARED:-cloudflared}"

if ! curl -sf "http://127.0.0.1:${FRONTEND_PORT}" >/dev/null 2>&1; then
  echo "❌ 프론트엔드(http://127.0.0.1:${FRONTEND_PORT})가 실행 중이 아닙니다."
  echo "   터미널 1: cd backend && npm run start:dev"
  echo "   터미널 2: cd frontend && npm run dev"
  exit 1
fi

if ! curl -sf "http://127.0.0.1:${BACKEND_PORT}" >/dev/null 2>&1; then
  echo "❌ 백엔드(http://127.0.0.1:${BACKEND_PORT})가 실행 중이 아닙니다."
  exit 1
fi

if ! command -v "$CLOUDFLARED" >/dev/null 2>&1; then
  echo "cloudflared 설치 중..."
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) CF_ARCH="amd64" ;;
    aarch64|arm64) CF_ARCH="arm64" ;;
    *) echo "지원하지 않는 아키텍처: $ARCH"; exit 1 ;;
  esac
  TMP="$(mktemp)"
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}" -o "$TMP"
  chmod +x "$TMP"
  CLOUDFLARED="$TMP"
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  FTS 외부 접속 URL 생성 중 (Cloudflare Tunnel)"
echo "  프론트엔드 API 프록시: /backend → localhost:${BACKEND_PORT}"
echo "══════════════════════════════════════════════════════"
echo ""
echo "  frontend/.env.local 에 다음이 설정되어 있어야 합니다:"
echo "    NEXT_PUBLIC_API_URL=/backend"
echo "    BACKEND_INTERNAL_URL=http://127.0.0.1:${BACKEND_PORT}"
echo ""
echo "  공개 URL이 출력되면 해당 주소를 모바일·다른 PC 브라우저에 입력하세요."
echo "  예: https://xxxx.trycloudflare.com/admin/stores"
echo ""
echo "  종료: Ctrl+C"
echo ""

exec "$CLOUDFLARED" tunnel --url "http://127.0.0.1:${FRONTEND_PORT}"
