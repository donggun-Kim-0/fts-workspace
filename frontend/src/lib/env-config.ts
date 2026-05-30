/** 브라우저 → Next.js rewrite 프록시 prefix (상대 경로) */
export const API_PROXY_PREFIX = '/backend';

const LOCAL_BACKEND_FALLBACK = 'http://127.0.0.1:4000';

function trimUrl(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/$/, '');
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  );
}

/** next.config rewrites · SSR 서버 → NestJS 실제 URL */
export function getBackendInternalUrl(): string {
  const internal = trimUrl(process.env.BACKEND_INTERNAL_URL);
  if (internal && isHttpUrl(internal)) return internal;

  const legacy = trimUrl(process.env.NEXT_PUBLIC_API_URL);
  if (legacy && isHttpUrl(legacy) && legacy !== API_PROXY_PREFIX) {
    return legacy;
  }

  return LOCAL_BACKEND_FALLBACK;
}

function isLocalhostApiUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * 브라우저에서 /backend 프록시를 써야 하는지
 * - NEXT_PUBLIC 미설정, localhost URL 설정, proxy 플래그, Vercel/터널 호스트
 */
export function shouldUseApiProxy(
  configured: string,
  hostname: string,
): boolean {
  if (process.env.NEXT_PUBLIC_API_PROXY === 'true') return true;
  if (configured === API_PROXY_PREFIX || configured === 'backend') return true;

  if (!configured) {
    return true;
  }

  if (isLocalhostApiUrl(configured) && !isLocalHostname(hostname)) {
    return true;
  }

  return false;
}

/**
 * 클라이언트(브라우저) API base — 기본 `/backend` 상대 경로
 */
export function getPublicApiUrl(): string {
  const configured = trimUrl(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    if (shouldUseApiProxy(configured, host)) {
      return API_PROXY_PREFIX;
    }

    if (configured && isHttpUrl(configured) && !isLocalhostApiUrl(configured)) {
      return configured;
    }

    if (isLocalHostname(host)) {
      return configured || LOCAL_BACKEND_FALLBACK;
    }

    return API_PROXY_PREFIX;
  }

  if (shouldUseApiProxy(configured, 'ssr')) {
    return getBackendInternalUrl();
  }

  if (configured === API_PROXY_PREFIX) {
    return getBackendInternalUrl();
  }

  if (configured && isHttpUrl(configured)) {
    return configured;
  }

  return getBackendInternalUrl();
}

/** 브라우저에서 잘못된 localhost URL 사용 방지 */
export function resolveBrowserApiUrl(candidate: string): string {
  if (typeof window === 'undefined') return candidate;

  const host = window.location.hostname;
  if (!isLocalHostname(host) && isLocalhostApiUrl(candidate)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[FTS API] 외부 호스트에서 localhost API URL이 차단되었습니다. /backend 프록시를 사용합니다.',
        { candidate, host },
      );
    }
    return API_PROXY_PREFIX;
  }

  if (!candidate) return API_PROXY_PREFIX;
  return candidate;
}
