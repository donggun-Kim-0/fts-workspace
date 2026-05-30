# FTS Workspace (Monorepo)

프랜차이즈 풀스택 MVP — **NestJS** (`backend/`) + **Next.js** (`frontend/`).

## 디렉터리 구조

```
fts-workspace/
├── backend/          # NestJS API, Prisma(Store), docker-compose
├── frontend/         # Next.js App Router, admin 가맹점 UI
├── package.json      # 루트 스크립트 (dev, build, db)
└── README.md
```

## 로컬 실행

### 1. PostgreSQL (선택)

```bash
npm run db:up
# 또는
cd backend && docker compose up -d
```

### 2. 백엔드 DB 스키마

```bash
cd backend
cp .env.example .env   # DATABASE_URL, FRONTEND_ORIGINS 설정
npx prisma db push
npx prisma generate
npm run start:dev      # http://localhost:4000
```

클라우드 DB(Render 등) 사용 시 `DATABASE_URL`을 외부 엔드포인트로 교체합니다 (`?sslmode=require`).

### 3. 프론트엔드

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

가맹점 관리: [http://localhost:3000/admin/stores](http://localhost:3000/admin/stores)

API 베이스: `GET/POST/PATCH/DELETE /stores` (Nest, 포트 4000). 프론트는 DB에 직접 접근하지 않습니다.

### 루트에서 한 번에

```bash
# 터미널 1
npm run dev:backend

# 터미널 2
npm run dev:frontend
```

## node_modules 정리

프로젝트 구조를 바꾼 뒤에는 **루트·frontend·backend 각각**에서 의존성을 다시 설치하세요.

```bash
# 루트 (스크립트만 있음 — node_modules 불필요)
# frontend
cd frontend && rm -rf node_modules .next && npm install

# backend
cd backend && rm -rf node_modules dist && npm install
```

루트에 남아 있던 `node_modules`는 삭제된 상태입니다. `npm run dev`는 `npm run dev --prefix frontend`로 동작합니다.

## 웹 배포 (Vercel + Render)

민감 정보는 **코드/`.env` 커밋 없이** 배포 플랫폼 환경 변수로 관리합니다.

| 구성 | 배포 대상 | 환경 변수 예시 |
|------|-----------|----------------|
| Next.js | Vercel (`frontend/` 루트) | `NEXT_PUBLIC_API_URL`, `KAKAO_REST_API_KEY` |
| NestJS API | Render / Railway | `DATABASE_URL`, `FRONTEND_ORIGINS` |
| PostgreSQL | Render PostgreSQL | `backend/.env`의 `DATABASE_URL` |

상세 절차: [DEPLOYMENT.md](./DEPLOYMENT.md)

로컬 설정 템플릿:
- `frontend/.env.example` → `frontend/.env.local`
- `backend/.env.example` → `backend/.env`
