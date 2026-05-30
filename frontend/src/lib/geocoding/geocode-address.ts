/**
 * 주소 → 위·경도
 * Next.js Route Handler(`/api/kakao/geocode`) 프록시 경유 — 브라우저에서 Kakao API 직접 호출 금지
 */
export type GeocodeAddressResult =
  | { status: 'success'; latitude: number; longitude: number }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

type KakaoGeocodeResponse = {
  documents?: { x?: string; y?: string }[];
  error?: string;
  message?: string;
};

export async function geocodeAddress(address: string): Promise<GeocodeAddressResult> {
  const trimmed = address.trim();
  if (!trimmed) {
    return { status: 'error', message: '주소가 비어 있습니다.' };
  }

  try {
    const params = new URLSearchParams({ address: trimmed });
    const response = await fetch(`/api/kakao/geocode?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = (await response.json()) as KakaoGeocodeResponse;

    console.log('카카오 API 응답 데이터:', data);

    if (!response.ok) {
      console.warn('[geocode] 프록시 API 오류:', response.status, data);
      return {
        status: 'error',
        message:
          data.message ??
          data.error ??
          `좌표 변환 API 오류 (${response.status})`,
      };
    }

    if (!Array.isArray(data.documents) || data.documents.length === 0) {
      return { status: 'not_found' };
    }

    const doc = data.documents[0];
    if (!doc?.x || !doc?.y) {
      return { status: 'not_found' };
    }

    const latitude = Number.parseFloat(doc.y);
    const longitude = Number.parseFloat(doc.x);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return { status: 'not_found' };
    }

    return { status: 'success', latitude, longitude };
  } catch (e) {
    console.warn('[geocode] 요청 실패:', e);
    return {
      status: 'error',
      message: e instanceof Error ? e.message : '좌표 변환 중 알 수 없는 오류',
    };
  }
}
