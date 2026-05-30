import { Injectable, Logger } from '@nestjs/common';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  provider: string;
  raw?: unknown;
};

/**
 * 주소 → 위·경도 연동 뼈대.
 * 실제 연동 시 KAKAO/NAVER/VWORLD API 키를 env에 두고 fetch 구현.
 */
@Injectable()
export class AddressGeocodingService {
  private readonly logger = new Logger(AddressGeocodingService.name);

  async geocode(
    address: string,
    addressDetail?: string | null,
  ): Promise<GeocodeResult | null> {
    const fullAddress = [address, addressDetail].filter(Boolean).join(' ').trim();

    if (!fullAddress) {
      return null;
    }

    const apiKey = process.env.GEOCODING_API_KEY;
    const provider = process.env.GEOCODING_PROVIDER ?? 'kakao';

    if (!apiKey) {
      this.logger.debug(
        `GEOCODING_API_KEY 미설정 — 좌표 스킵 (${fullAddress})`,
      );
      return null;
    }

    // TODO: provider별 REST 호출 구현
    // 예) Kakao: GET https://dapi.kakao.com/v2/local/search/address.json
    this.logger.warn(
      `Geocoding provider=${provider} — API 연동 구현 예정 (${fullAddress})`,
    );

    return null;
  }
}
