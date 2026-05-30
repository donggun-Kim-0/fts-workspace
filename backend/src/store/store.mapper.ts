import { Prisma } from '@prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { normalizeBusinessRegNo } from '../shared/validation/business-reg-no.util';

export type ComputedContractDates = {
  expireDate: Date | null;
  terminateNoticeDate: Date | null;
};

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
} | null;

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return value as Prisma.InputJsonValue;
}

export function resolveOwnerPhone(
  dto: Pick<CreateStoreDto | UpdateStoreDto, 'ownerPhone' | 'contact'>,
): string | undefined {
  return dto.ownerPhone ?? dto.contact;
}

export function mapCreateDtoToPrismaInput(
  dto: CreateStoreDto,
  branchCode: string,
  computed: ComputedContractDates,
  geo: GeoCoordinates,
): Prisma.StoreCreateInput {
  const ownerPhone = resolveOwnerPhone(dto);

  return {
    branchCode,
    branchName: dto.branchName,
    contractBrand: dto.contractBrand ?? null,
    status: dto.status ?? 'OPEN',
    branchType: dto.branchType ?? null,
    region: dto.region ?? null,
    supervisor: dto.supervisor ?? null,
    bizRegNo: dto.bizRegNo ? normalizeBusinessRegNo(dto.bizRegNo) : null,
    ownerName: dto.ownerName,
    corpRegNo: dto.corpRegNo ?? null,
    bizName: dto.bizName ?? null,
    bizType: dto.bizType ?? null,
    bizCategory: dto.bizCategory ?? null,
    address: dto.address ?? null,
    disclosureReplyDate: parseDate(dto.disclosureReplyDate),
    coverageArea: dto.coverageArea ?? null,
    initialContractDate: parseDate(dto.initialContractDate),
    renewalContractDate: parseDate(dto.renewalContractDate),
    expireDate: computed.expireDate,
    terminateNoticeDate: computed.terminateNoticeDate,
    openedAt: parseDate(dto.openedAt),
    franchiseFee: dto.franchiseFee ?? null,
    educationFee: dto.educationFee ?? null,
    royaltyAmount: dto.royaltyAmount ?? null,
    royaltyDate: dto.royaltyDate ?? null,
    terminateDate: parseDate(dto.terminateDate),
    operationDuration: dto.operationDuration ?? null,
    ownerPhone: ownerPhone ?? null,
    ownerEmail: dto.ownerEmail ?? null,
    ownerBirth: dto.ownerBirth ?? null,
    storePhone: dto.storePhone ?? null,
    managerName: dto.managerName ?? null,
    managerPhone: dto.managerPhone ?? null,
    homeAddress: dto.homeAddress ?? null,
    staffCount: dto.staffCount ?? 0,
    partTimeCount: dto.partTimeCount ?? 0,
    laborCost: dto.laborCost ?? 0,
    zipCode: dto.zipCode ?? null,
    latitude: geo?.latitude ?? dto.latitude ?? null,
    longitude: geo?.longitude ?? dto.longitude ?? null,
    marketType: dto.marketType ?? null,
    businessHours: dto.businessHours ?? null,
    breakTime: dto.breakTime ?? null,
    holidays: toJson(dto.holidays),
    platformInfo: toJson(dto.platformInfo),
    posInfo: toJson(dto.posInfo),
    tableOrderInfo: toJson(dto.tableOrderInfo),
    ktServices: toJson(dto.ktServices),
    mapUrls: toJson(dto.mapUrls),
  };
}

export function mapUpdateDtoToPrismaInput(
  dto: UpdateStoreDto,
  existing: Prisma.StoreGetPayload<object>,
  computed: ComputedContractDates,
  geo: GeoCoordinates,
): Prisma.StoreUpdateInput {
  const ownerPhone =
    dto.ownerPhone !== undefined || dto.contact !== undefined
      ? resolveOwnerPhone(dto)
      : undefined;

  return {
    ...(dto.branchCode !== undefined && { branchCode: dto.branchCode }),
    ...(dto.branchName !== undefined && { branchName: dto.branchName }),
    ...(dto.contractBrand !== undefined && { contractBrand: dto.contractBrand }),
    ...(dto.status !== undefined && { status: dto.status }),
    ...(dto.branchType !== undefined && { branchType: dto.branchType }),
    ...(dto.region !== undefined && { region: dto.region }),
    ...(dto.supervisor !== undefined && { supervisor: dto.supervisor }),
    ...(dto.bizRegNo !== undefined && {
      bizRegNo: dto.bizRegNo ? normalizeBusinessRegNo(dto.bizRegNo) : null,
    }),
    ...(dto.ownerName !== undefined && { ownerName: dto.ownerName }),
    ...(dto.corpRegNo !== undefined && { corpRegNo: dto.corpRegNo }),
    ...(dto.bizName !== undefined && { bizName: dto.bizName }),
    ...(dto.bizType !== undefined && { bizType: dto.bizType }),
    ...(dto.bizCategory !== undefined && { bizCategory: dto.bizCategory }),
    ...(dto.address !== undefined && { address: dto.address }),
    ...(dto.disclosureReplyDate !== undefined && {
      disclosureReplyDate: parseDate(dto.disclosureReplyDate),
    }),
    ...(dto.coverageArea !== undefined && { coverageArea: dto.coverageArea }),
    ...(dto.initialContractDate !== undefined && {
      initialContractDate: parseDate(dto.initialContractDate),
    }),
    ...(dto.renewalContractDate !== undefined && {
      renewalContractDate: parseDate(dto.renewalContractDate),
    }),
    expireDate: computed.expireDate,
    terminateNoticeDate: computed.terminateNoticeDate,
    ...(dto.openedAt !== undefined && { openedAt: parseDate(dto.openedAt) }),
    ...(dto.franchiseFee !== undefined && { franchiseFee: dto.franchiseFee }),
    ...(dto.educationFee !== undefined && { educationFee: dto.educationFee }),
    ...(dto.royaltyAmount !== undefined && { royaltyAmount: dto.royaltyAmount }),
    ...(dto.royaltyDate !== undefined && { royaltyDate: dto.royaltyDate }),
    ...(dto.terminateDate !== undefined && {
      terminateDate: parseDate(dto.terminateDate),
    }),
    ...(dto.operationDuration !== undefined && {
      operationDuration: dto.operationDuration,
    }),
    ...(ownerPhone !== undefined && { ownerPhone }),
    ...(dto.ownerEmail !== undefined && { ownerEmail: dto.ownerEmail }),
    ...(dto.ownerBirth !== undefined && { ownerBirth: dto.ownerBirth }),
    ...(dto.storePhone !== undefined && { storePhone: dto.storePhone }),
    ...(dto.managerName !== undefined && { managerName: dto.managerName }),
    ...(dto.managerPhone !== undefined && { managerPhone: dto.managerPhone }),
    ...(dto.homeAddress !== undefined && { homeAddress: dto.homeAddress }),
    ...(dto.staffCount !== undefined && { staffCount: dto.staffCount }),
    ...(dto.partTimeCount !== undefined && { partTimeCount: dto.partTimeCount }),
    ...(dto.laborCost !== undefined && { laborCost: dto.laborCost }),
    ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
    latitude: geo?.latitude ?? dto.latitude ?? existing.latitude,
    longitude: geo?.longitude ?? dto.longitude ?? existing.longitude,
    ...(dto.marketType !== undefined && { marketType: dto.marketType }),
    ...(dto.businessHours !== undefined && { businessHours: dto.businessHours }),
    ...(dto.breakTime !== undefined && { breakTime: dto.breakTime }),
    ...(dto.holidays !== undefined && { holidays: toJson(dto.holidays) }),
    ...(dto.platformInfo !== undefined && {
      platformInfo: toJson(dto.platformInfo),
    }),
    ...(dto.posInfo !== undefined && { posInfo: toJson(dto.posInfo) }),
    ...(dto.tableOrderInfo !== undefined && {
      tableOrderInfo: toJson(dto.tableOrderInfo),
    }),
    ...(dto.ktServices !== undefined && { ktServices: toJson(dto.ktServices) }),
    ...(dto.mapUrls !== undefined && { mapUrls: toJson(dto.mapUrls) }),
  };
}

export { parseDate };
