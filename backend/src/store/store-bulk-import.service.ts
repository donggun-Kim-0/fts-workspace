import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import {
  isValidBusinessRegNo,
  normalizeBusinessRegNo,
} from '../shared/validation/business-reg-no.util';
import { StoreAutomationService } from './store-automation.service';
import { AddressGeocodingService } from '../shared/address/address-geocoding.service';
import {
  BulkImportReport,
  BulkImportRowError,
} from './types/bulk-import.types';

export type { BulkImportReport, BulkImportRowError } from './types/bulk-import.types';

const REQUIRED_COLUMNS = ['branchName', 'ownerName', 'address'] as const;

type ParsedRow = Record<string, string>;

@Injectable()
export class StoreBulkImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automation: StoreAutomationService,
    private readonly geocoding: AddressGeocodingService,
  ) {}

  parseExcelBuffer(buffer: Buffer): ParsedRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('엑셀 시트가 비어 있습니다.');
    }

    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<ParsedRow>(sheet, {
      defval: '',
      raw: false,
    }).map((row) => {
      const normalized: ParsedRow = {};
      for (const [k, v] of Object.entries(row)) {
        normalized[String(k).trim()] = String(v ?? '').trim();
      }
      return normalized;
    });
  }

  private validateRow(
    row: ParsedRow,
    rowIndex: number,
    seenBranchCodes: Set<string>,
    seenBizRegNos: Set<string>,
  ): BulkImportRowError[] {
    const errors: BulkImportRowError[] = [];

    for (const col of REQUIRED_COLUMNS) {
      if (!row[col]?.trim()) {
        errors.push({
          row: rowIndex,
          field: col,
          code: 'REQUIRED',
          message: `필수값 누락: ${col}`,
        });
      }
    }

    const phone = row.ownerPhone?.trim() || row.contact?.trim();
    if (!phone) {
      errors.push({
        row: rowIndex,
        field: 'ownerPhone',
        code: 'REQUIRED',
        message: '필수값 누락: ownerPhone 또는 contact',
      });
    }

    if (row.bizRegNo?.trim()) {
      if (!isValidBusinessRegNo(row.bizRegNo)) {
        errors.push({
          row: rowIndex,
          field: 'bizRegNo',
          code: 'FORMAT',
          message: '사업자등록번호 형식이 올바르지 않습니다.',
        });
      } else {
        const normalized = normalizeBusinessRegNo(row.bizRegNo);
        if (seenBizRegNos.has(normalized)) {
          errors.push({
            row: rowIndex,
            field: 'bizRegNo',
            code: 'DUPLICATE',
            message: '엑셀 내 사업자등록번호 중복',
          });
        }
        seenBizRegNos.add(normalized);
      }
    }

    if (row.branchCode?.trim()) {
      const code = row.branchCode.trim();
      if (seenBranchCodes.has(code)) {
        errors.push({
          row: rowIndex,
          field: 'branchCode',
          code: 'DUPLICATE',
          message: '엑셀 내 지점코드 중복',
        });
      }
      seenBranchCodes.add(code);
    }

    return errors;
  }

  async importFromBuffer(buffer: Buffer): Promise<BulkImportReport> {
    const rows = this.parseExcelBuffer(buffer);
    const report: BulkImportReport = {
      total: rows.length,
      successCount: 0,
      failureCount: 0,
      createdIds: [],
      errors: [],
    };

    const seenBranchCodes = new Set<string>();
    const seenBizRegNos = new Set<string>();
    const rowResults: { rowIndex: number; row: ParsedRow; errors: BulkImportRowError[] }[] =
      [];

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2;
      const errors = this.validateRow(
        rows[i],
        rowIndex,
        seenBranchCodes,
        seenBizRegNos,
      );
      rowResults.push({ rowIndex, row: rows[i], errors });
      if (errors.length > 0) {
        report.errors.push(...errors);
      }
    }

    for (const { rowIndex, row, errors } of rowResults.filter(
      (r) => r.errors.length === 0,
    )) {
      try {
        const created = await this.createFromRow(row);
        report.createdIds.push(created.id);
        report.successCount += 1;
      } catch (error) {
        report.errors.push({
          row: rowIndex,
          code: 'UNKNOWN',
          message:
            error instanceof Error ? error.message : '저장 중 알 수 없는 오류',
        });
      }
    }

    report.failureCount = new Set(report.errors.map((e) => e.row)).size;
    return report;
  }

  private async createFromRow(row: ParsedRow) {
    return this.prisma.$transaction(async (tx) => {
      const branchCode =
        row.branchCode?.trim() ||
        (await this.automation.generateBranchCode(tx));

      const initialContractDate = row.initialContractDate
        ? new Date(row.initialContractDate)
        : null;
      const renewalContractDate = row.renewalContractDate
        ? new Date(row.renewalContractDate)
        : null;

      const computed = await this.automation.resolveComputedFields({
        initialContractDate,
        contractPeriodMonths: row.contractPeriodMonths
          ? Number.parseInt(row.contractPeriodMonths, 10)
          : 36,
        renewalContractDate,
        terminationNoticePeriodKey: row.terminationNoticePeriodKey || null,
      });

      const geo = row.address
        ? await this.geocoding.geocode(row.address)
        : null;

      return tx.store.create({
        data: {
          branchCode,
          branchName: row.branchName,
          contractBrand: row.contractBrand || null,
          status: row.status || 'OPEN',
          branchType: row.branchType || null,
          region: row.region || null,
          supervisor: row.supervisor || null,
          bizRegNo: row.bizRegNo
            ? normalizeBusinessRegNo(row.bizRegNo)
            : null,
          ownerName: row.ownerName,
          address: row.address,
          ownerPhone: row.ownerPhone || row.contact || null,
          initialContractDate,
          renewalContractDate,
          expireDate: computed.expireDate,
          terminateNoticeDate: computed.terminateNoticeDate,
          latitude: geo?.latitude ?? null,
          longitude: geo?.longitude ?? null,
        },
      });
    });
  }
}
