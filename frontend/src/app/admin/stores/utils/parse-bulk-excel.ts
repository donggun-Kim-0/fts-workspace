import * as XLSX from 'xlsx';
import type { StoreFormPayload } from '@/lib/api/stores';
import {
  DUMMY_REGION_OPTIONS,
  DUMMY_STATUS_OPTIONS,
  DUMMY_SV_OPTIONS,
} from '../constants/select-options';
import { BULK_HEADER_TO_KEY } from '../constants/bulk-upload-template';
import { ADDRESS_PREFIX_TO_REGION } from '../constants/region-supervisor-map';
import { REGION_TO_SUPERVISOR } from '../constants/region-supervisor-map';

const REGION_LABEL_TO_KEY = Object.fromEntries(
  DUMMY_REGION_OPTIONS.map((option) => [option.label, option.value]),
);

const SV_LABEL_TO_KEY = Object.fromEntries(
  DUMMY_SV_OPTIONS.map((option) => [option.label, option.value]),
);

const STATUS_LABEL_TO_KEY = Object.fromEntries(
  DUMMY_STATUS_OPTIONS.map((option) => [option.label, option.value]),
);

export type ParsedBulkRow = {
  row: number;
  payload: StoreFormPayload;
};

export type BulkParseError = {
  row: number;
  message: string;
};

function cellValue(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function combineAddress(base: string, detail: string): string | undefined {
  const b = base.trim();
  const d = detail.trim();
  if (!b && !d) return undefined;
  if (!d) return b;
  if (!b) return d;
  return `${b} ${d}`;
}

function resolveRegionKey(raw: string, baseAddress: string): string | undefined {
  const value = raw.trim();
  if (value) {
    return REGION_LABEL_TO_KEY[value] ?? value;
  }

  const trimmed = baseAddress.trim();
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

function resolveSupervisorKey(
  raw: string,
  regionKey: string | undefined,
): string | undefined {
  const value = raw.trim();
  if (value) {
    return SV_LABEL_TO_KEY[value] ?? value;
  }
  if (regionKey) {
    return REGION_TO_SUPERVISOR[regionKey];
  }
  return undefined;
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number.parseInt(trimmed, 10);
  return Number.isNaN(n) ? undefined : n;
}

function buildJsonFields(row: Record<string, string>) {
  const posInfo =
    row.posVendor || row.posContractDate
      ? {
          vendor: row.posVendor || undefined,
          contractDate: row.posContractDate || undefined,
        }
      : undefined;

  const platformInfo = row.platformBaeminId
    ? { baeminStoreId: row.platformBaeminId }
    : undefined;

  const ktInternet = ['Y', 'y', 'true', 'TRUE', '1', '예', '사용'].includes(
    row.ktInternet ?? '',
  );

  const ktServices = ktInternet ? { internet: true } : undefined;

  return { posInfo, platformInfo, ktServices };
}

function mapRowToPayload(
  row: Record<string, string>,
  rowNumber: number,
): { payload?: StoreFormPayload; error?: BulkParseError } {
  if (Object.values(row).every((value) => !value.trim())) {
    return {};
  }

  if (!row.branchName?.trim()) {
    return {
      error: {
        row: rowNumber,
        message: '지점명은 필수 입력 항목입니다.',
      },
    };
  }

  if (!row.ownerName?.trim()) {
    return {
      error: {
        row: rowNumber,
        message: '대표자명은 필수 입력 항목입니다.',
      },
    };
  }

  const baseAddress = row.baseAddress ?? '';
  const addressDetail = row.addressDetail ?? '';
  const address = combineAddress(baseAddress, addressDetail);
  const regionKey = resolveRegionKey(row.region ?? '', baseAddress);
  const supervisorKey = resolveSupervisorKey(row.supervisor ?? '', regionKey);

  const statusRaw = row.status?.trim();
  const status =
    (statusRaw && (STATUS_LABEL_TO_KEY[statusRaw] ?? statusRaw)) || 'OPEN';

  const jsonFields = buildJsonFields(row);

  const payload: StoreFormPayload = {
    branchName: row.branchName.trim(),
    ownerName: row.ownerName.trim(),
    status,
    branchCode: row.branchCode || undefined,
    bizRegNo: row.bizRegNo || undefined,
    ownerPhone: row.ownerPhone || undefined,
    contact: row.ownerPhone || undefined,
    storePhone: row.storePhone || undefined,
    contractBrand: row.contractBrand || undefined,
    branchType: row.branchType || undefined,
    region: regionKey,
    supervisor: supervisorKey,
    zipCode: row.zipCode || undefined,
    address,
    marketType: row.marketType || undefined,
    businessHours: row.businessHours || undefined,
    initialContractDate: row.initialContractDate || undefined,
    renewalContractDate: row.renewalContractDate || undefined,
    contractPeriodMonths: parseOptionalInt(row.contractPeriodMonths ?? ''),
    franchiseFee: parseOptionalInt(row.franchiseFee ?? ''),
    educationFee: parseOptionalInt(row.educationFee ?? ''),
    ...jsonFields,
  };

  return { payload };
}

export function parseBulkExcelBuffer(buffer: ArrayBuffer): {
  items: StoreFormPayload[];
  errors: BulkParseError[];
} {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      items: [],
      errors: [{ row: 0, message: '엑셀 시트가 비어 있습니다.' }],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });

  const items: StoreFormPayload[] = [];
  const errors: BulkParseError[] = [];

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const normalized: Record<string, string> = {};

    for (const [header, value] of Object.entries(rawRow)) {
      const key = BULK_HEADER_TO_KEY[String(header).trim()] ?? String(header).trim();
      normalized[key] = cellValue(value);
    }

    const result = mapRowToPayload(normalized, rowNumber);
    if (result.error) {
      errors.push(result.error);
    } else if (result.payload) {
      items.push(result.payload);
    }
  });

  return { items, errors };
}
