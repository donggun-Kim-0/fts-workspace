/** 배달 플랫폼 드롭다운 (TODO: MasterConfig DELIVERY_PLATFORM 연동) */
export const DELIVERY_PLATFORM_OPTIONS = [
  { value: 'BAEMIN', label: '배달의민족' },
  { value: 'COUPANG', label: '쿠팡이츠' },
  { value: 'YOGIYO', label: '요기요' },
  { value: 'DDANGYO', label: '땡겨요' },
  { value: 'OTHER', label: '기타' },
] as const;

export const EMPTY_PLATFORM_LINK = {
  platform: '',
  storeName: '',
  id: '',
  password: '',
  url: '',
};
