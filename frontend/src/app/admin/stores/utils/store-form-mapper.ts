import type { Store, StoreFormPayload } from '@/lib/api/stores';
import { EMPTY_PLATFORM_LINK } from '../constants/delivery-platform-options';
import {
  defaultStoreFormValues,
  type StoreFormValues,
} from '../schemas/store-form.schema';

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function strOrUndefined(v: string | undefined): string | undefined {
  const t = (v ?? '').trim();
  return t || undefined;
}

function intOrUndefined(v: string | undefined): number | undefined {
  const t = (v ?? '').trim();
  if (!t) return undefined;
  const n = Number.parseInt(t, 10);
  return Number.isNaN(n) ? undefined : n;
}

function floatOrUndefined(v: string | undefined): number | undefined {
  const t = (v ?? '').trim();
  if (!t) return undefined;
  const n = Number.parseFloat(t);
  return Number.isNaN(n) ? undefined : n;
}

function pickStr(obj: Record<string, unknown> | null | undefined, key: string): string {
  const v = obj?.[key];
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function pickBool(obj: Record<string, unknown> | null | undefined, key: string): boolean {
  return Boolean(obj?.[key]);
}

function buildObject(entries: [string, unknown][]): Record<string, unknown> | undefined {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of entries) {
    if (v !== undefined && v !== null && v !== '' && v !== false) {
      obj[k] = v;
    }
  }
  return Object.keys(obj).length > 0 ? obj : undefined;
}

function combineAddress(base: string | undefined, detail: string | undefined): string | undefined {
  const b = (base ?? '').trim();
  const d = (detail ?? '').trim();
  if (!b && !d) return undefined;
  if (!d) return b;
  if (!b) return d;
  return `${b} ${d}`;
}

function parseHolidays(text: string | undefined): string[] | undefined {
  const t = (text ?? '').trim();
  if (!t) return undefined;
  const arr = t.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

type PlatformLinkRow = {
  platform: string;
  storeName: string;
  id: string;
  password: string;
  url: string;
};

function normalizePlatformLink(raw: unknown): PlatformLinkRow {
  const row = raw as Record<string, unknown>;
  return {
    platform: pickStr(row, 'platform'),
    storeName: pickStr(row, 'storeName'),
    id: pickStr(row, 'id'),
    password: pickStr(row, 'password'),
    url: pickStr(row, 'url'),
  };
}

function parsePlatformLinks(platform: Record<string, unknown> | null): PlatformLinkRow[] {
  const linksRaw = platform?.platformLinks;
  if (Array.isArray(linksRaw) && linksRaw.length > 0) {
    return linksRaw.map(normalizePlatformLink);
  }

  const legacy: PlatformLinkRow[] = [];
  if (pickStr(platform, 'baeminStoreId') || pickStr(platform, 'baeminUrl')) {
    legacy.push({
      platform: 'BAEMIN',
      storeName: '',
      id: pickStr(platform, 'baeminStoreId'),
      password: '',
      url: pickStr(platform, 'baeminUrl'),
    });
  }
  if (pickStr(platform, 'coupangStoreId')) {
    legacy.push({
      platform: 'COUPANG',
      storeName: '',
      id: pickStr(platform, 'coupangStoreId'),
      password: '',
      url: '',
    });
  }
  if (pickStr(platform, 'yogiyoStoreId')) {
    legacy.push({
      platform: 'YOGIYO',
      storeName: '',
      id: pickStr(platform, 'yogiyoStoreId'),
      password: '',
      url: '',
    });
  }

  return legacy.length > 0 ? legacy : [{ ...EMPTY_PLATFORM_LINK }];
}

function buildPlatformInfo(
  links: StoreFormValues['platformLinks'],
): Record<string, unknown> | undefined {
  const filtered = links
    .map((row) => ({
      platform: (row.platform ?? '').trim(),
      storeName: (row.storeName ?? '').trim(),
      id: (row.id ?? '').trim(),
      password: (row.password ?? '').trim(),
      url: (row.url ?? '').trim(),
    }))
    .filter((row) => row.platform || row.storeName || row.id || row.password || row.url);

  if (filtered.length === 0) return undefined;

  return { platformLinks: filtered };
}

function parseMapLinks(maps: Record<string, unknown> | null): {
  naver: string;
  kakao: string;
  google: string;
} {
  const nested = maps?.mapLinks as Record<string, unknown> | undefined;
  return {
    naver: pickStr(maps, 'naver') || pickStr(nested, 'naver'),
    kakao: pickStr(maps, 'kakao') || pickStr(nested, 'kakao'),
    google: pickStr(maps, 'google') || pickStr(nested, 'google'),
  };
}

function buildMapLinks(values: StoreFormValues): Record<string, unknown> | undefined {
  const mapLinks = {
    naver: strOrUndefined(values.mapNaverUrl),
    kakao: strOrUndefined(values.mapKakaoUrl),
    google: strOrUndefined(values.mapGoogleUrl),
  };

  const hasAny = mapLinks.naver || mapLinks.kakao || mapLinks.google;
  if (!hasAny) return undefined;

  return {
    ...mapLinks,
    mapLinks,
  };
}

export function storeToFormValues(store: Store): StoreFormValues {
  const pos = store.posInfo as Record<string, unknown> | null;
  const table = store.tableOrderInfo as Record<string, unknown> | null;
  const platform = store.platformInfo as Record<string, unknown> | null;
  const kt = store.ktServices as Record<string, unknown> | null;
  const maps = store.mapUrls as Record<string, unknown> | null;

  const holidaysArr = Array.isArray(store.holidays) ? store.holidays : [];

  return {
    ...defaultStoreFormValues,
    branchCode: store.branchCode,
    branchName: store.branchName,
    contractBrand: store.contractBrand ?? '',
    status: store.status,
    branchType: store.branchType ?? '',
    region: store.region ?? '',
    supervisor: store.supervisor ?? '',
    marketType: store.marketType ?? '',

    bizRegNo: store.bizRegNo ?? '',
    corpRegNo: store.corpRegNo ?? '',
    bizName: store.bizName ?? '',
    bizType: store.bizType ?? '',
    bizCategory: store.bizCategory ?? '',
    ownerName: store.ownerName,
    ownerPhone: store.ownerPhone ?? store.contact ?? '',
    ownerEmail: store.ownerEmail ?? '',
    ownerBirth: store.ownerBirth ?? '',
    storePhone: store.storePhone ?? '',
    managerName: store.managerName ?? '',
    managerPhone: store.managerPhone ?? '',
    homeAddress: store.homeAddress ?? '',
    staffCount: String(store.staffCount ?? 0),
    partTimeCount: String(store.partTimeCount ?? 0),
    laborCost: String(store.laborCost ?? 0),

    zipCode: store.zipCode ?? '',
    baseAddress: store.address ?? '',
    addressDetail: '',
    latitude: store.latitude != null ? String(store.latitude) : '',
    longitude: store.longitude != null ? String(store.longitude) : '',
    businessHours: store.businessHours ?? '',
    breakTime: store.breakTime ?? '',
    holidaysText: holidaysArr.map(String).join(', '),
    openedAt: toDateInput(store.openedAt),

    disclosureReplyDate: toDateInput(store.disclosureReplyDate),
    coverageArea: store.coverageArea ?? '',
    initialContractDate: toDateInput(store.initialContractDate),
    renewalContractDate: toDateInput(store.renewalContractDate),
    franchiseFee: store.franchiseFee != null ? String(store.franchiseFee) : '',
    educationFee: store.educationFee != null ? String(store.educationFee) : '',
    royaltyAmount: store.royaltyAmount != null ? String(store.royaltyAmount) : '',
    royaltyDate: store.royaltyDate ?? '',
    terminateDate: toDateInput(store.terminateDate),
    operationDuration:
      store.operationDuration != null ? String(store.operationDuration) : '',

    posVendor: pickStr(pos, 'vendor'),
    posContractDate: pickStr(pos, 'contractDate'),
    posSwType: pickStr(pos, 'swType'),
    posUrl: pickStr(pos, 'url'),
    posId: pickStr(pos, 'id'),
    posPassword: pickStr(pos, 'password'),

    tableOrderEnabled: pickBool(table, 'enabled'),
    tableOrderVendor: pickStr(table, 'vendor'),
    tableOrderQuantity:
      table?.quantity != null ? String(table.quantity) : '',
    tableOrderContractDate: pickStr(table, 'contractDate'),
    tableOrderId: pickStr(table, 'id'),
    tableOrderPassword: pickStr(table, 'password'),

    platformLinks: parsePlatformLinks(platform),

    ktInternet: pickBool(kt, 'internet'),
    ktTv: pickBool(kt, 'tv'),
    ktCctv: pickBool(kt, 'cctv'),

    mapNaverUrl: parseMapLinks(maps).naver,
    mapKakaoUrl: parseMapLinks(maps).kakao,
    mapGoogleUrl: parseMapLinks(maps).google,
  };
}

export function formValuesToPayload(values: StoreFormValues): StoreFormPayload {
  return {
    branchName: values.branchName.trim(),
    ownerName: values.ownerName.trim(),
    status: values.status || 'OPEN',
    branchCode: strOrUndefined(values.branchCode),
    contractBrand: strOrUndefined(values.contractBrand),
    branchType: strOrUndefined(values.branchType),
    region: strOrUndefined(values.region),
    supervisor: strOrUndefined(values.supervisor),
    marketType: strOrUndefined(values.marketType),

    bizRegNo: strOrUndefined(values.bizRegNo),
    corpRegNo: strOrUndefined(values.corpRegNo),
    bizName: strOrUndefined(values.bizName),
    bizType: strOrUndefined(values.bizType),
    bizCategory: strOrUndefined(values.bizCategory),
    address: combineAddress(values.baseAddress, values.addressDetail),
    zipCode: strOrUndefined(values.zipCode),
    latitude: floatOrUndefined(values.latitude),
    longitude: floatOrUndefined(values.longitude),
    businessHours: strOrUndefined(values.businessHours),
    breakTime: strOrUndefined(values.breakTime),
    holidays: parseHolidays(values.holidaysText),
    openedAt: strOrUndefined(values.openedAt),

    ownerPhone: strOrUndefined(values.ownerPhone),
    contact: strOrUndefined(values.ownerPhone),
    ownerEmail: strOrUndefined(values.ownerEmail),
    ownerBirth: strOrUndefined(values.ownerBirth),
    storePhone: strOrUndefined(values.storePhone),
    managerName: strOrUndefined(values.managerName),
    managerPhone: strOrUndefined(values.managerPhone),
    homeAddress: strOrUndefined(values.homeAddress),
    staffCount: intOrUndefined(values.staffCount),
    partTimeCount: intOrUndefined(values.partTimeCount),
    laborCost: intOrUndefined(values.laborCost),

    disclosureReplyDate: strOrUndefined(values.disclosureReplyDate),
    coverageArea: strOrUndefined(values.coverageArea),
    initialContractDate: strOrUndefined(values.initialContractDate),
    renewalContractDate: strOrUndefined(values.renewalContractDate),
    contractPeriodMonths: intOrUndefined(values.contractPeriodMonths),
    terminationNoticePeriodKey: strOrUndefined(values.terminationNoticePeriodKey),
    franchiseFee: intOrUndefined(values.franchiseFee),
    educationFee: intOrUndefined(values.educationFee),
    royaltyAmount: intOrUndefined(values.royaltyAmount),
    royaltyDate: strOrUndefined(values.royaltyDate),
    terminateDate: strOrUndefined(values.terminateDate),
    operationDuration: intOrUndefined(values.operationDuration),

    posInfo: buildObject([
      ['vendor', strOrUndefined(values.posVendor)],
      ['contractDate', strOrUndefined(values.posContractDate)],
      ['swType', strOrUndefined(values.posSwType)],
      ['url', strOrUndefined(values.posUrl)],
      ['id', strOrUndefined(values.posId)],
      ['password', strOrUndefined(values.posPassword)],
    ]),
    tableOrderInfo: buildObject([
      ['enabled', values.tableOrderEnabled],
      ['vendor', strOrUndefined(values.tableOrderVendor)],
      ['quantity', intOrUndefined(values.tableOrderQuantity)],
      ['contractDate', strOrUndefined(values.tableOrderContractDate)],
      ['id', strOrUndefined(values.tableOrderId)],
      ['password', strOrUndefined(values.tableOrderPassword)],
    ]),
    platformInfo: buildPlatformInfo(values.platformLinks),
    ktServices: buildObject([
      ['internet', values.ktInternet],
      ['tv', values.ktTv],
      ['cctv', values.ktCctv],
    ]),
    mapUrls: buildMapLinks(values),
  };
}

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('ko-KR');
}

export function formatFieldErrors(errors: Record<string, { message?: string }>): string {
  const messages = Object.values(errors)
    .map((e) => e.message)
    .filter(Boolean) as string[];
  return messages.length > 0
    ? messages.join(' · ')
    : '입력값을 확인해 주세요.';
}
