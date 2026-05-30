/**
 * 주소 접두어 → 지자체(region key)
 * TODO: MasterConfig API 또는 별도 매핑 테이블로 교체
 */
export const ADDRESS_PREFIX_TO_REGION: Record<string, string> = {
  서울특별시: 'SEOUL',
  서울: 'SEOUL',
  경기도: 'GYEONGGI',
  경기: 'GYEONGGI',
  부산광역시: 'BUSAN',
  부산: 'BUSAN',
};

/**
 * 지자체(region key) → 담당 SV(supervisor key) 매핑
 * TODO: MasterConfig API 또는 별도 매핑 테이블로 교체
 */
export const REGION_TO_SUPERVISOR: Record<string, string> = {
  SEOUL: 'SV_KIM',
  GYEONGGI: 'SV_LEE',
  BUSAN: 'SV_PARK',
};
