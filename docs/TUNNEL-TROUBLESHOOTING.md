# Cloudflare Tunnel 무한 로딩 — 원인 및 예방

## 문제 증상

- `*.trycloudflare.com` 접속 시 UI는 보이지만 **「데이터를 불러오는 중...」** 에서 멈춤
- 콘솔에 `WebSocket ... webpack-hmr ... 502` (dev 모드 한정)
- PC·모바일 모두 API 기능 미동작

---

## 근본 원인 (3가지)

### 1. axios URL 조합 버그 (가장 치명적)

```
baseURL: '/backend'
url:     '/stores'   ← 선행 슬래시 때문에 baseURL 무시
→ 실제 요청: https://터널주소/stores (404)
→ 올바른 경로: https://터널주소/backend/stores
```

axios는 `url`이 `/`로 시작하면 **절대 경로**로 처리해 `baseURL`을 버립니다.  
터널·Vercel 등 **same-origin 프록시(`/backend`)** 환경에서 반복적으로 API 실패를 유발했습니다.

**수정:** `joinApiPath()`로 `/backend/stores` 형태로 항상 결합 (`frontend/src/lib/api/client.ts`)

---

### 2. React fetch abort → 로딩 상태 고착

검색·필터·페이지 변경 시 이previous 요청을 `AbortController`로 취소합니다.  
취소된 요청과 새 요청이 겹치면서 `isLoading`이 `true`에 고착될 수 있었습니다.

**수정:** `cancelled` 플래그로 **활성 요청만** 상태 반영 (`page.tsx`)

---

### 3. 터널 + `next dev` 조합의 불안정성

| 항목 | dev (`next dev`) | production (`next start`) |
|------|------------------|---------------------------|
| HMR WebSocket | 터널에서 **502** 빈번 | 없음 |
| API 프록시 | rewrite 의존 | 동일 |
| 외부 공유 | 데모용 | **권장** |

Cloudflare Quick Tunnel은 WebSocket(HMR)을 안정적으로 프록시하지 못합니다.

---

## 필수 환경 변수 (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=/backend
NEXT_PUBLIC_API_PROXY=true
BACKEND_INTERNAL_URL=http://127.0.0.1:4000
```

---

## 올바른 실행 순서

```bash
# 1. 백엔드
cd backend && npm run start:dev

# 2-A. 외부 공유 (권장)
chmod +x scripts/expose-prod.sh
./scripts/expose-prod.sh

# 2-B. 로컬 개발만
cd frontend && npm run dev
```

---

## 빠른 자가 진단

```bash
# ✅ 200
curl -I "https://YOUR-TUNNEL.trycloudflare.com/backend/stores?page=1&limit=1"

# ❌ 404 — API 경로 문제
curl -I "https://YOUR-TUNNEL.trycloudflare.com/stores"
```
