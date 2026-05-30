import type { MasterConfigFormOptions } from '@/lib/api/master-config';

/** S/W 종류 key → POS 로그인 URL (MasterConfig 미설정 시 폴백) */
export const POS_SW_URL_BY_KEY: Record<string, string> = {
  POS_CLOUD: 'https://pos-cloud.example.com/login',
  POS_ONPREM: 'https://pos-onprem.example.com/admin',
};

/**
 * MasterConfig SW_TYPE value가 "표시명|https://..." 형식이면 URL 추출,
 * 없으면 POS_SW_URL_BY_KEY 폴백 사용
 */
export function resolvePosSwUrl(
  swTypeKey: string,
  formOptions: MasterConfigFormOptions | null,
): string {
  if (!swTypeKey) return '';

  const item = formOptions?.SW_TYPE?.find((i) => i.key === swTypeKey);
  if (item?.value) {
    const parts = item.value.split('|').map((s) => s.trim());
    if (parts.length >= 2 && /^https?:\/\//i.test(parts[1])) {
      return parts[1];
    }
  }

  return POS_SW_URL_BY_KEY[swTypeKey] ?? '';
}
