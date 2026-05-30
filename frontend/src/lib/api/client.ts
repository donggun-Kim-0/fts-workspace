import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { getPublicApiUrl } from '@/env.public';

export function getApiBase(): string {
  return getPublicApiUrl();
}

/**
 * axios는 url이 `/`로 시작하면 baseURL을 무시함.
 * `/backend` + `/stores` → `/stores`(404) 되는 문제를 방지.
 */
export function joinApiPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.replace(/^\//, '');
  if (!normalizedPath) return normalizedBase || '/';
  if (!normalizedBase) return `/${normalizedPath}`;
  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase}/${normalizedPath}`;
  }
  return `${normalizedBase}/${normalizedPath}`;
}

export const apiClient = axios.create({
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const msg = (body as { message?: unknown }).message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const apiBase = getPublicApiUrl();
  const url = joinApiPath(apiBase, path);

  try {
    const res = await apiClient.request<T>({
      url,
      method: config.method ?? 'GET',
      data: config.data,
      signal: config.signal,
      ...config,
    });
    return res.data;
  } catch (err) {
    if (axios.isCancel(err) || (err instanceof Error && err.name === 'AbortError')) {
      throw err;
    }
    const ax = err as AxiosError<{ message?: string | string[] }>;
    const status = ax.response?.status ?? 0;
    const body = ax.response?.data;

    if (!ax.response) {
      throw new ApiError(
        `백엔드(${apiBase})에 연결할 수 없습니다. API 서버가 실행 중인지 확인하세요.`,
        0,
      );
    }

    throw new ApiError(
      messageFromBody(body, ax.message || `요청 실패 (HTTP ${status})`),
      status,
      body,
    );
  }
}
