/** 엑셀 양식 컬럼 정의 (헤더 = 한글, key = API 필드명) */
export const BULK_UPLOAD_COLUMNS = [
  { header: '지점명', key: 'branchName', required: true, example: '강남 1호점' },
  { header: '지점코드', key: 'branchCode', example: '(비우면 자동)' },
  { header: '운영상태', key: 'status', example: 'OPEN' },
  { header: '사업자등록번호', key: 'bizRegNo', example: '123-45-67890' },
  { header: '대표자명', key: 'ownerName', required: true, example: '홍길동' },
  { header: '대표자연락처', key: 'ownerPhone', example: '010-1234-5678' },
  { header: '매장연락처', key: 'storePhone', example: '02-123-4567' },
  { header: '계약브랜드', key: 'contractBrand', example: 'BRAND_A' },
  { header: '영업형태', key: 'branchType', example: 'STANDALONE' },
  { header: '지자체', key: 'region', example: '서울특별시 또는 SEOUL' },
  { header: '담당SV', key: 'supervisor', example: '김철수 또는 SV_KIM' },
  { header: '우편번호', key: 'zipCode', example: '06234' },
  { header: '기본주소', key: 'baseAddress', example: '서울특별시 강남구 테헤란로 123' },
  { header: '상세주소', key: 'addressDetail', example: '1층 101호' },
  { header: '상권유형', key: 'marketType', example: 'OFFICE' },
  { header: '영업시간', key: 'businessHours', example: '09:00-22:00' },
  { header: '최초계약일', key: 'initialContractDate', example: '2024-01-01' },
  { header: '갱신계약일', key: 'renewalContractDate', example: '2027-01-01' },
  { header: '계약기간(월)', key: 'contractPeriodMonths', example: '36' },
  { header: '가맹비', key: 'franchiseFee', example: '5000000' },
  { header: '교육비', key: 'educationFee', example: '1000000' },
  { header: 'POS업체', key: 'posVendor', example: 'HW_A' },
  { header: 'POS계약일', key: 'posContractDate', example: '2024-01-01' },
  { header: '배민스토어ID', key: 'platformBaeminId', example: '' },
  { header: 'KT인터넷', key: 'ktInternet', example: 'Y' },
] as const;

export const BULK_HEADER_TO_KEY: Record<string, string> = Object.fromEntries(
  BULK_UPLOAD_COLUMNS.map((col) => [col.header, col.key]),
);

export const BULK_TEMPLATE_FILENAME = '가맹점_일괄등록_양식.xlsx';
