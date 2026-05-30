/**
 * TODO: MasterConfig API 연동 — GET /master-config?category=...
 * 현재는 개발용 더미 옵션입니다.
 */
export const DUMMY_STATUS_OPTIONS = [
  { value: 'OPEN', label: '운영중' },
  { value: 'PRE_OPEN', label: '오픈 예정' },
  { value: 'SUSPENDED', label: '일시중지' },
  { value: 'CLOSED', label: '폐점' },
  { value: 'TERMINATED', label: '해지' },
] as const;

// TODO: MasterConfig category=BRAND
export const DUMMY_BRAND_OPTIONS = [
  { value: 'BRAND_A', label: '브랜드 A' },
  { value: 'BRAND_B', label: '브랜드 B' },
];

// TODO: MasterConfig category=BRANCH_TYPE
export const DUMMY_BRANCH_TYPE_OPTIONS = [
  { value: 'COMPLEX', label: '복합매장' },
  { value: 'SHOP_IN_SHOP', label: '샵인샵' },
  { value: 'STANDALONE', label: '단독매장' },
];

// TODO: MasterConfig category=REGION
export const DUMMY_REGION_OPTIONS = [
  { value: 'SEOUL', label: '서울특별시' },
  { value: 'GYEONGGI', label: '경기도' },
  { value: 'BUSAN', label: '부산광역시' },
];

// TODO: MasterConfig category=SV_MANAGER (supervisor)
export const DUMMY_SV_OPTIONS = [
  { value: 'SV_KIM', label: '김철수' },
  { value: 'SV_LEE', label: '이영희' },
  { value: 'SV_PARK', label: '박민수' },
];

// TODO: MasterConfig category=MARKET_TYPE
export const DUMMY_MARKET_TYPE_OPTIONS = [
  { value: 'OFFICE', label: '오피스 상권' },
  { value: 'RESIDENTIAL', label: '주거 상권' },
  { value: 'STATION', label: '역세권' },
];

// TODO: MasterConfig category=TERMINATION_NOTICE_PERIOD
export const DUMMY_NOTICE_PERIOD_OPTIONS = [
  { value: '90', label: '90일 전 통보' },
  { value: '60', label: '60일 전 통보' },
  { value: '30', label: '30일 전 통보' },
];

// TODO: MasterConfig category=POS_HW
export const DUMMY_POS_HW_OPTIONS = [
  { value: 'HW_A', label: 'H/W 업체 A' },
  { value: 'HW_B', label: 'H/W 업체 B' },
];

// TODO: MasterConfig category=SW_TYPE
export const DUMMY_POS_SW_OPTIONS = [
  { value: 'POS_CLOUD', label: '클라우드 POS' },
  { value: 'POS_ONPREM', label: '온프레미스 POS' },
];

// TODO: MasterConfig category=TABLE_ORDER_VENDOR
export const DUMMY_TABLE_ORDER_VENDOR_OPTIONS = [
  { value: 'TORDER_A', label: '테이블오더 A' },
  { value: 'TORDER_B', label: '테이블오더 B' },
];

export const STATUS_LABEL: Record<string, string> = {
  OPEN: '운영중',
  PRE_OPEN: '오픈 예정',
  SUSPENDED: '일시중지',
  CLOSED: '폐점',
  TERMINATED: '해지',
};

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'bg-emerald-50 text-emerald-700';
    case 'PRE_OPEN':
      return 'bg-blue-50 text-blue-700';
    case 'SUSPENDED':
      return 'bg-amber-50 text-amber-700';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-600';
    case 'TERMINATED':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}
