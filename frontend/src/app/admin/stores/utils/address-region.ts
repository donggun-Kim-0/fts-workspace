import { ADDRESS_PREFIX_TO_REGION } from '../constants/region-supervisor-map';

/** 주소 맨 앞 토큰(또는 접두어)으로 지자체(region key) 추출 */
export function extractRegionKeyFromAddress(address: string): string | undefined {
  const trimmed = address.trim();
  if (!trimmed) return undefined;

  const firstToken = trimmed.split(/\s+/)[0] ?? '';

  const prefixes = Object.keys(ADDRESS_PREFIX_TO_REGION).sort(
    (a, b) => b.length - a.length,
  );

  for (const prefix of prefixes) {
    if (firstToken.startsWith(prefix) || trimmed.startsWith(prefix)) {
      return ADDRESS_PREFIX_TO_REGION[prefix];
    }
  }

  return undefined;
}
