/**
 * 브라우저 노출 가능한 환경 변수 (NEXT_PUBLIC_*)
 *
 * `/backend` — Next.js rewrite 프록시 (터널·Vercel 단일 URL)
 * 외부 도메인(trycloudflare.com 등)에서는 localhost API 호출을 자동 차단하고 `/backend` 사용
 */
function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  );
}

export function getPublicApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // 터널·Vercel 등 외부 접속 — 반드시 same-origin 프록시
    if (!isLocalHostname(host)) {
      if (configured === '/backend' || process.env.NEXT_PUBLIC_API_PROXY === 'true') {
        return '/backend';
      }
      if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
        return configured;
      }
      return '/backend';
    }

    if (configured === '/backend' || process.env.NEXT_PUBLIC_API_PROXY === 'true') {
      return '/backend';
    }
    return configured || 'http://localhost:4000';
  }

  // SSR / Route Handler
  if (configured === '/backend' || process.env.NEXT_PUBLIC_API_PROXY === 'true') {
    return process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, '') || 'http://127.0.0.1:4000';
  }
  return configured || 'http://localhost:4000';
}
