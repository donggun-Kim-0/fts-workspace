/**
 * 서버 전용 환경 변수 (Route Handler, Server Components)
 * NEXT_PUBLIC_ 접두사 없이 Vercel Environment Variables에 등록
 */
export function getKakaoRestApiKey(): string | undefined {
  return process.env.KAKAO_REST_API_KEY?.trim() || undefined;
}
