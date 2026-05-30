<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:fts-deployment-rules -->
# FTS 배포 환경 (Vercel + Render)

인프라·API·환경변수 관련 작업 시 `.cursor/rules/fts-deployment-infrastructure.mdc` 규칙을 따른다.

- API: `/backend` 프록시 + `NEXT_PUBLIC_API_URL` (localhost 절대 URL 하드코딩 금지)
- Node: `frontend/package.json` → `engines.node >= 20.0.0` 유지
- DB: `DATABASE_URL`은 **backend**만 (Render External URL)
- 신규 env 추가 시 Vercel·Render 대시보드 반영을 작업자에게 안내
<!-- END:fts-deployment-rules -->
