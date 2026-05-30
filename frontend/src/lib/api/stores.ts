import { apiRequest } from './client';

/** API 응답 Store (백엔드 Prisma Store + contact 호환 필드) */
export type Store = {
  id: string;
  branchCode: string;
  branchName: string;
  contractBrand: string | null;
  status: string;
  branchType: string | null;
  region: string | null;
  supervisor: string | null;
  bizRegNo: string | null;
  ownerName: string;
  corpRegNo: string | null;
  bizName: string | null;
  bizType: string | null;
  bizCategory: string | null;
  address: string | null;
  disclosureReplyDate: string | null;
  coverageArea: string | null;
  initialContractDate: string | null;
  renewalContractDate: string | null;
  expireDate: string | null;
  terminateNoticeDate: string | null;
  openedAt: string | null;
  franchiseFee: number | null;
  educationFee: number | null;
  royaltyAmount: number | null;
  royaltyDate: string | null;
  terminateDate: string | null;
  operationDuration: number | null;
  ownerPhone: string | null;
  contact: string;
  ownerEmail: string | null;
  ownerBirth: string | null;
  storePhone: string | null;
  managerName: string | null;
  managerPhone: string | null;
  homeAddress: string | null;
  staffCount: number | null;
  partTimeCount: number | null;
  laborCost: number | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  marketType: string | null;
  businessHours: string | null;
  breakTime: string | null;
  holidays: unknown;
  platformInfo: Record<string, unknown> | null;
  posInfo: Record<string, unknown> | null;
  tableOrderInfo: Record<string, unknown> | null;
  ktServices: Record<string, unknown> | null;
  mapUrls: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

/** POST/PATCH /stores 요청 body */
export type StoreFormPayload = {
  branchCode?: string;
  branchName: string;
  ownerName: string;
  contractBrand?: string;
  status?: string;
  branchType?: string;
  region?: string;
  supervisor?: string;
  bizRegNo?: string;
  corpRegNo?: string;
  bizName?: string;
  bizType?: string;
  bizCategory?: string;
  address?: string;
  disclosureReplyDate?: string;
  coverageArea?: string;
  initialContractDate?: string;
  renewalContractDate?: string;
  contractPeriodMonths?: number;
  terminationNoticePeriodKey?: string;
  openedAt?: string;
  franchiseFee?: number;
  educationFee?: number;
  royaltyAmount?: number;
  royaltyDate?: string;
  terminateDate?: string;
  operationDuration?: number;
  contact?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerBirth?: string;
  storePhone?: string;
  managerName?: string;
  managerPhone?: string;
  homeAddress?: string;
  staffCount?: number;
  partTimeCount?: number;
  laborCost?: number;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  marketType?: string;
  businessHours?: string;
  breakTime?: string;
  holidays?: unknown[];
  platformInfo?: Record<string, unknown>;
  posInfo?: Record<string, unknown>;
  tableOrderInfo?: Record<string, unknown>;
  ktServices?: Record<string, unknown>;
  mapUrls?: Record<string, unknown>;
};

function normalizeDate(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

export function normalizeStore(row: Store): Store {
  return {
    ...row,
    expireDate: normalizeDate(row.expireDate),
    initialContractDate: normalizeDate(row.initialContractDate),
    renewalContractDate: normalizeDate(row.renewalContractDate),
    openedAt: normalizeDate(row.openedAt),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    contact: row.contact ?? row.ownerPhone ?? '',
  };
}

export type ListStoresParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type StoresListMeta = {
  total: number;
  page: number;
  lastPage: number;
};

export type StoresListResponse = {
  data: Store[];
  meta: StoresListMeta;
};

function buildQueryString(params?: ListStoresParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.search?.trim()) qs.set('search', params.search.trim());
  if (params.status?.trim()) qs.set('status', params.status.trim());
  if (params.page != null) qs.set('page', String(params.page));
  if (params.limit != null) qs.set('limit', String(params.limit));
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export async function listStores(
  params?: ListStoresParams,
  signal?: AbortSignal,
): Promise<StoresListResponse> {
  const raw = await apiRequest<StoresListResponse>(`/stores${buildQueryString(params)}`, {
    signal,
  });
  return {
    data: (raw.data ?? []).map((row) => normalizeStore(row as Store)),
    meta: raw.meta ?? { total: 0, page: 1, lastPage: 1 },
  };
}

export async function createStore(payload: StoreFormPayload): Promise<Store> {
  const created = await apiRequest<Store>('/stores', { method: 'POST', data: payload });
  return normalizeStore(created);
}

export async function updateStore(
  id: string,
  payload: Partial<StoreFormPayload>,
): Promise<Store> {
  const updated = await apiRequest<Store>(`/stores/${id}`, {
    method: 'PATCH',
    data: payload,
  });
  return normalizeStore(updated);
}

export async function deleteStore(id: string): Promise<void> {
  await apiRequest<void>(`/stores/${id}`, { method: 'DELETE' });
}

export type BulkImportRowError = {
  row: number;
  field?: string;
  code: 'REQUIRED' | 'FORMAT' | 'DUPLICATE' | 'UNKNOWN';
  message: string;
};

export type BulkImportReport = {
  total: number;
  successCount: number;
  failureCount: number;
  createdIds: string[];
  errors: BulkImportRowError[];
};

export async function bulkCreateStores(
  items: StoreFormPayload[],
): Promise<BulkImportReport> {
  return apiRequest<BulkImportReport>('/stores/bulk', {
    method: 'POST',
    data: { items },
  });
}
