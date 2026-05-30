# 배포 가이드 (Vercel + Render)

## ⚠️ Vercel 빌드 실패 시 (No Next.js version detected)

모노레포이므로 Vercel **Root Directory**를 반드시 `frontend`로 설정하세요.

1. Vercel Dashboard → 프로젝트 → **Settings → General**
2. **Root Directory** → `frontend` 입력 → Save
3. **Redeploy** 실행

자세한 환경 변수: [frontend/VERCEL.md](./frontend/VERCEL.md)

---

프론트엔드(Next.js)는 **Vercel**, 백엔드(NestJS)와 DB(PostgreSQL)는 **Render** 등에 분리 배포합니다.

## 아키텍처

```
브라우저 → Vercel (Next.js)
              ├─ NEXT_PUBLIC_API_URL → Render NestJS API
              └─ KAKAO_REST_API_KEY → /api/kakao/geocode (서버 전용)
Render NestJS → DATABASE_URL → Render PostgreSQL
```

## 1. 환경 변수 분리

| 위치 | 파일 (로컬) | Vercel / Render |
|------|-------------|-----------------|
| 프론트 Public | `frontend/.env.local` | Vercel Project → Environment Variables |
| 프론트 Secret | `frontend/.env.local` | `KAKAO_REST_API_KEY` (Production + Preview) |
| 백엔드 | `backend/.env` | Render Web Service → Environment |

**민감 정보는 `.env.example`에만 placeholder를 두고, 실제 값은 배포 플랫폼에 등록합니다.**

### Vercel (frontend 루트 디렉터리)

| 변수 | 예시 | 비고 |
|------|------|------|
| `NEXT_PUBLIC_API_URL` | `/backend` | **권장** — Next.js 프록시 (CORS 불필요) |
| `BACKEND_INTERNAL_URL` | `https://fts-api.onrender.com` | Vercel 서버 → Render API (서버 전용) |
| `KAKAO_REST_API_KEY` | `xxxxxxxx` | 서버 전용, `NEXT_PUBLIC_` 금지 |

**권장 설정 (단일 도메인):**
```
NEXT_PUBLIC_API_URL=/backend
BACKEND_INTERNAL_URL=https://your-api.onrender.com
```
브라우저는 Vercel 도메인만 사용하고, API는 Next.js rewrite로 백엔드에 전달됩니다.

Vercel 프로젝트 설정:
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (기본)
- **Install Command**: `npm install`

### Render (backend)

| 변수 | 예시 | 비고 |
|------|------|------|
| `DATABASE_URL` | Render PostgreSQL Internal/External URL | `?sslmode=require` 포함 |
| `PORT` | `4000` | Render가 주입하는 경우 생략 가능 |
| `FRONTEND_ORIGINS` | `https://your-app.vercel.app` | CORS, 쉼표 구분 |
| `ALLOW_VERCEL_PREVIEW` | `true` | Vercel 프리뷰 URL 허용 시 |

## 2. 클라우드 DB 연결 (Render PostgreSQL)

1. Render Dashboard → **New PostgreSQL** 생성
2. **External Database URL** 복사 (로컬 마이그레이션·배포용)
3. `backend/.env`의 `DATABASE_URL`을 아래 형식으로 교체:

```
postgresql://USER:PASSWORD@HOST.region-postgres.render.com/DATABASE?sslmode=require
```

4. 스키마 반영:

```bash
cd backend
npx prisma db push
npx prisma db seed   # 선택: MasterConfig 시드
```

5. 로컬 Docker DB는 중지:

```bash
docker compose -f backend/docker-compose.yml down
```

`render.yaml` Blueprint로 API + DB를 한 번에 생성할 수도 있습니다.

## 3. 배포 순서

1. **Render**: PostgreSQL 생성 → Web Service(backend) 배포 → API URL 확인
2. **Vercel**: `NEXT_PUBLIC_API_URL`에 Render API URL 설정 → frontend 배포
3. **Render**: `FRONTEND_ORIGINS`에 Vercel 도메인 추가
4. Kakao Developers → REST API 키 **도메인**에 Vercel URL 등록

## 4. 로컬 vs 프로덕션

| | 로컬 | 프로덕션 |
|---|------|----------|
| DB | `docker compose` (localhost:5432) | Render PostgreSQL URL |
| API | localhost:4000 | Render Web Service |
| 프론트 | localhost:3000 | *.vercel.app |

로컬 설정은 `backend/.env.example`, `frontend/.env.example`을 참고하세요.

## 5. 즉시 외부 접속 (개발·데모)

백엔드·프론트 dev 서버 실행 후:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=/backend
BACKEND_INTERNAL_URL=http://127.0.0.1:4000

cd frontend && npm run expose
```

출력된 `https://xxxx.trycloudflare.com` 주소를 모바일·다른 PC에서 열면 됩니다.  
(임시 URL — PC를 끄거나 터널을 종료하면 접속 불가)
