import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

const STORE_STATUSES = ['OPEN', 'CLOSED', 'SUSPENDED', 'PRE_OPEN', 'TERMINATED'] as const;

/**
 * Prisma Store 모델 + 자동화용 API 전용 필드(contractPeriodMonths, terminationNoticePeriodKey)
 */
export class CreateStoreDto {
  // ─── 식별 ───
  @IsOptional()
  @IsString()
  branchCode?: string;

  @IsString()
  @IsNotEmpty()
  branchName!: string;

  @IsOptional()
  @IsString()
  contractBrand?: string;

  @IsOptional()
  @IsString()
  @IsIn([...STORE_STATUSES])
  status?: string;

  @IsOptional()
  @IsString()
  branchType?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  supervisor?: string;

  // ─── 사업자 등록 ───
  @IsOptional()
  @IsString()
  bizRegNo?: string;

  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @IsOptional()
  @IsString()
  corpRegNo?: string;

  @IsOptional()
  @IsString()
  bizName?: string;

  @IsOptional()
  @IsString()
  bizType?: string;

  @IsOptional()
  @IsString()
  bizCategory?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // ─── 계약 ───
  @IsOptional()
  @IsDateString()
  disclosureReplyDate?: string;

  @IsOptional()
  @IsString()
  coverageArea?: string;

  @IsOptional()
  @IsDateString()
  initialContractDate?: string;

  @IsOptional()
  @IsDateString()
  renewalContractDate?: string;

  /** DB 필드 아님 — expireDate 자동 계산용 (기본 36개월) */
  @IsOptional()
  @IsInt()
  @Min(1)
  contractPeriodMonths?: number;

  /** DB 필드 아님 — terminateNoticeDate 자동 계산용 MasterConfig key */
  @IsOptional()
  @IsString()
  terminationNoticePeriodKey?: string;

  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  franchiseFee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  educationFee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  royaltyAmount?: number;

  @IsOptional()
  @IsString()
  royaltyDate?: string;

  @IsOptional()
  @IsDateString()
  terminateDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  operationDuration?: number;

  // ─── 가맹점 / 대표자 ───
  /** 프론트 호환 alias → ownerPhone */
  @IsOptional()
  @IsString()
  contact?: string;

  @ValidateIf((o: CreateStoreDto) => !o.contact)
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsOptional()
  @IsEmail()
  ownerEmail?: string;

  @IsOptional()
  @IsString()
  ownerBirth?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsString()
  managerPhone?: string;

  @IsOptional()
  @IsString()
  homeAddress?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  staffCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  partTimeCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  laborCost?: number;

  // ─── 위치 / 영업 ───
  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  marketType?: string;

  @IsOptional()
  @IsString()
  businessHours?: string;

  @IsOptional()
  @IsString()
  breakTime?: string;

  @IsOptional()
  @IsArray()
  holidays?: unknown[];

  // ─── JSON 인프라 ───
  @IsOptional()
  @IsObject()
  platformInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  posInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  tableOrderInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  ktServices?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  mapUrls?: Record<string, unknown>;
}
