import { NextRequest, NextResponse } from 'next/server';
import { getKakaoRestApiKey } from '@/env.server';

const KAKAO_ADDRESS_API = 'https://dapi.kakao.com/v2/local/search/address.json';

/**
 * Kakao Local API 프록시 — 브라우저 CORS/Domain 제한 우회
 * REST API 키는 서버 전용 env(KAKAO_REST_API_KEY)에만 설정 (Vercel Environment Variables)
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')?.trim();
  if (!address) {
    return NextResponse.json({ error: 'address 파라미터가 필요합니다.' }, { status: 400 });
  }

  const apiKey = getKakaoRestApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { error: 'KAKAO_REST_API_KEY가 설정되지 않았습니다. (Vercel → Environment Variables)' },
      { status: 500 },
    );
  }

  const url = new URL(KAKAO_ADDRESS_API);
  url.searchParams.set('query', address);

  let kakaoResponse: Response;
  try {
    kakaoResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: 'KakaoAK ' + apiKey,
      },
      cache: 'no-store',
    });
  } catch (e) {
    console.warn('[kakao/geocode] Kakao fetch 실패:', e);
    return NextResponse.json({ error: 'Kakao API 연결에 실패했습니다.' }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await kakaoResponse.json();
  } catch (e) {
    console.warn('[kakao/geocode] Kakao JSON 파싱 실패:', e);
    return NextResponse.json({ error: 'Kakao API 응답 파싱 실패' }, { status: 502 });
  }

  console.log('카카오 API 응답 데이터:', data);

  if (!kakaoResponse.ok) {
    console.warn('[kakao/geocode] Kakao API HTTP 오류:', kakaoResponse.status, data);
  }

  return NextResponse.json(data, { status: kakaoResponse.status });
}
