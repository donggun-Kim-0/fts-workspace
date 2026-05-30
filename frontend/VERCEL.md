# Vercel 배포 (프론트엔드)

## 1. 프로젝트 Root Directory (필수)

Vercel Dashboard → **Project Settings → General → Root Directory**

```
frontend
```

`frontend` 로 설정 후 Save. (모노레포에서 Next.js가 이 폴더에 있음)

루트 `vercel.json`의 install/build 명령은 Root Directory=`frontend` 일 때 자동으로 frontend 기준으로 동작합니다.

## 2. Environment Variables

| 변수 | 값 (예시) | 환경 |
|------|-----------|------|
| `NEXT_PUBLIC_API_URL` | `/backend` | Production, Preview |
| `NEXT_PUBLIC_API_PROXY` | `true` | Production, Preview |
| `BACKEND_INTERNAL_URL` | `https://fts-api.onrender.com` | Production, Preview |
| `KAKAO_REST_API_KEY` | (카카오 REST API 키) | Production, Preview |

> `BACKEND_INTERNAL_URL`은 Render NestJS Web Service URL입니다. 배포 후 Render에서 확인하세요.

## 3. Render 연동 후

Render Web Service → Environment:

```
FRONTEND_ORIGINS=https://your-project.vercel.app
ALLOW_VERCEL_PREVIEW=true
```

## 4. 재배포

Git push 후 Vercel이 자동 빌드합니다.

```bash
git push origin main
```
