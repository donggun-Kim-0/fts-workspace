import { apiRequest } from './client';

export type MasterConfig = {
  id: number;
  category: string;
  key: string;
  value: string;
  isActive: boolean;
  createdAt: string;
};

export type MasterConfigCategory = {
  category: string;
  label: string;
};

export type MasterConfigUsage = {
  storeCount: number;
  category: string;
  key: string;
  canDelete: boolean;
};

export type MasterConfigFormOptions = Record<
  string,
  { key: string; value: string }[]
>;

export type SelectOption = { value: string; label: string };

export function toSelectOptions(
  items: { key: string; value: string }[] | undefined,
): SelectOption[] {
  return (items ?? []).map((item) => ({ value: item.key, label: item.value }));
}

export async function listMasterConfigCategories(): Promise<MasterConfigCategory[]> {
  return apiRequest<MasterConfigCategory[]>('/master-config/categories');
}

export async function listMasterConfigs(params?: {
  category?: string;
  activeOnly?: boolean;
}): Promise<MasterConfig[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.activeOnly === false) qs.set('activeOnly', 'false');
  const query = qs.toString();
  const rows = await apiRequest<MasterConfig[]>(
    `/master-config${query ? `?${query}` : ''}`,
  );
  return rows.map((row) => ({
    ...row,
    createdAt: String(row.createdAt),
  }));
}

export async function getMasterConfigFormOptions(): Promise<MasterConfigFormOptions> {
  return apiRequest<MasterConfigFormOptions>('/master-config/form-options');
}

export async function getMasterConfigUsage(id: number): Promise<MasterConfigUsage> {
  return apiRequest<MasterConfigUsage>(`/master-config/${id}/usage`);
}

export async function createMasterConfig(payload: {
  category: string;
  key: string;
  value: string;
  isActive?: boolean;
}): Promise<MasterConfig> {
  return apiRequest<MasterConfig>('/master-config', {
    method: 'POST',
    data: payload,
  });
}

export async function updateMasterConfig(
  id: number,
  payload: Partial<{
    category: string;
    key: string;
    value: string;
    isActive: boolean;
  }>,
): Promise<MasterConfig> {
  return apiRequest<MasterConfig>(`/master-config/${id}`, {
    method: 'PATCH',
    data: payload,
  });
}

export async function deleteMasterConfig(id: number): Promise<MasterConfig> {
  return apiRequest<MasterConfig>(`/master-config/${id}`, {
    method: 'DELETE',
  });
}

/** category → Select 옵션 (폼 필드 매핑) */
export const FORM_FIELD_TO_CATEGORY: Record<string, string> = {
  contractBrand: 'BRAND',
  status: 'STORE_STATUS',
  region: 'REGION',
  supervisor: 'SV_MANAGER',
  branchType: 'BRANCH_TYPE',
  marketType: 'MARKET_TYPE',
  terminationNoticePeriodKey: 'TERMINATION_NOTICE_PERIOD',
  posVendor: 'POS_HW',
  posSwType: 'SW_TYPE',
  tableOrderVendor: 'TABLE_ORDER_VENDOR',
};

export function pickOptions(
  formOptions: MasterConfigFormOptions | null,
  category: string,
  fallback: SelectOption[] = [],
): SelectOption[] {
  const items = formOptions?.[category];
  if (!items?.length) return fallback;
  return toSelectOptions(items);
}

export function buildStatusLabelMap(
  formOptions: MasterConfigFormOptions | null,
): Record<string, string> {
  const items = formOptions?.STORE_STATUS ?? [];
  return Object.fromEntries(items.map((item) => [item.key, item.value]));
}
