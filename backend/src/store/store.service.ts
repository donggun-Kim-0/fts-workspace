import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Store } from '@prisma/client';
import {
  isValidBusinessRegNo,
  normalizeBusinessRegNo,
} from '../shared/validation/business-reg-no.util';
import { PrismaService } from '../prisma/prisma.service';
import { MasterConfigService } from '../master-config/master-config.service';
import { MASTER_CONFIG_CATEGORIES } from '../shared/constants/master-config-categories';
import { AddressGeocodingService } from '../shared/address/address-geocoding.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { FindStoresQueryDto } from './dto/find-stores-query.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import {
  BulkImportReport,
  BulkImportRowError,
} from './types/bulk-import.types';
import {
  mapCreateDtoToPrismaInput,
  mapUpdateDtoToPrismaInput,
  parseDate,
} from './store.mapper';
import { StoreAutomationService } from './store-automation.service';

/** 프론트 호환: ownerPhone → contact */
export function toApiStore<T extends Store>(store: T) {
  return {
    ...store,
    contact: store.ownerPhone ?? '',
  };
}

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masterConfig: MasterConfigService,
    private readonly automation: StoreAutomationService,
    private readonly geocoding: AddressGeocodingService,
  ) {}

  private async validateMasterKeys(dto: CreateStoreDto | UpdateStoreDto) {
    const checks: [string, string | undefined][] = [
      [MASTER_CONFIG_CATEGORIES.BRAND, dto.contractBrand],
      [MASTER_CONFIG_CATEGORIES.STORE_STATUS, dto.status],
      [MASTER_CONFIG_CATEGORIES.BRANCH_TYPE, dto.branchType],
      [MASTER_CONFIG_CATEGORIES.REGION, dto.region],
      [MASTER_CONFIG_CATEGORIES.MARKET_TYPE, dto.marketType],
      [MASTER_CONFIG_CATEGORIES.SV_MANAGER, dto.supervisor],
      [
        MASTER_CONFIG_CATEGORIES.TERMINATION_NOTICE_PERIOD,
        dto.terminationNoticePeriodKey,
      ],
    ];

    for (const [category, key] of checks) {
      await this.masterConfig.assertActiveKey(category, key);
    }
  }

  private async resolveGeo(
    address: string | null | undefined,
    dtoLat?: number,
    dtoLng?: number,
  ) {
    if (address) {
      const geo = await this.geocoding.geocode(address);
      if (geo) return geo;
    }
    if (dtoLat !== undefined) {
      return { latitude: dtoLat, longitude: dtoLng ?? 0 };
    }
    return null;
  }

  async create(dto: CreateStoreDto) {
    if (dto.bizRegNo && !isValidBusinessRegNo(dto.bizRegNo)) {
      throw new ConflictException('사업자등록번호 형식이 올바르지 않습니다.');
    }

    await this.validateMasterKeys(dto);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const branchCode =
          dto.branchCode?.trim() ||
          (await this.automation.generateBranchCode(tx));

        const initialContractDate = parseDate(dto.initialContractDate);
        const renewalContractDate = parseDate(dto.renewalContractDate);

        const computed = await this.automation.resolveComputedFields({
          initialContractDate,
          contractPeriodMonths: dto.contractPeriodMonths,
          renewalContractDate,
          terminationNoticePeriodKey: dto.terminationNoticePeriodKey,
        });

        const geo = await this.resolveGeo(
          dto.address,
          dto.latitude,
          dto.longitude,
        );

        const created = await tx.store.create({
          data: mapCreateDtoToPrismaInput(dto, branchCode, computed, geo),
        });

        return toApiStore(created);
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          '지점코드 또는 사업자등록번호가 이미 사용 중입니다.',
        );
      }
      throw error;
    }
  }

  async findAll(query: FindStoresQueryDto = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {};

    const status = query.status?.trim();
    if (status) {
      where.status = status;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { branchName: { contains: search, mode: 'insensitive' } },
        { branchCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / limit));

    return {
      data: rows.map(toApiStore),
      meta: { total, page, lastPage },
    };
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException(`가맹점 ID ${id}를 찾을 수 없습니다.`);
    }
    return toApiStore(store);
  }

  async update(id: string, dto: UpdateStoreDto) {
    const existing = await this.prisma.store.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`가맹점 ID ${id}를 찾을 수 없습니다.`);
    }

    if (dto.bizRegNo && !isValidBusinessRegNo(dto.bizRegNo)) {
      throw new ConflictException('사업자등록번호 형식이 올바르지 않습니다.');
    }

    await this.validateMasterKeys(dto);

    const initialContractDate =
      dto.initialContractDate !== undefined
        ? parseDate(dto.initialContractDate)
        : existing.initialContractDate;
    const renewalContractDate =
      dto.renewalContractDate !== undefined
        ? parseDate(dto.renewalContractDate)
        : existing.renewalContractDate;

    const computed = await this.automation.resolveComputedFields({
      initialContractDate,
      contractPeriodMonths: dto.contractPeriodMonths ?? 36,
      renewalContractDate,
      terminationNoticePeriodKey: dto.terminationNoticePeriodKey,
    });

    const address =
      dto.address !== undefined ? dto.address : existing.address;
    const geo = await this.resolveGeo(
      address,
      dto.latitude,
      dto.longitude,
    );

    try {
      const updated = await this.prisma.store.update({
        where: { id },
        data: mapUpdateDtoToPrismaInput(dto, existing, computed, geo),
      });
      return toApiStore(updated);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('지점코드 또는 사업자등록번호가 중복됩니다.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.store.delete({ where: { id } });
  }

  async bulkCreate(items: CreateStoreDto[]): Promise<BulkImportReport> {
    const report: BulkImportReport = {
      total: items.length,
      successCount: 0,
      failureCount: 0,
      createdIds: [],
      errors: [],
    };

    if (items.length === 0) {
      return report;
    }

    const branchCodesToCheck = items
      .map((item) => item.branchCode?.trim())
      .filter((code): code is string => Boolean(code));

    const bizRegNosToCheck = items
      .map((item) =>
        item.bizRegNo?.trim() ? normalizeBusinessRegNo(item.bizRegNo) : null,
      )
      .filter((no): no is string => Boolean(no));

    const orConditions: Prisma.StoreWhereInput[] = [];
    if (branchCodesToCheck.length > 0) {
      orConditions.push({ branchCode: { in: branchCodesToCheck } });
    }
    if (bizRegNosToCheck.length > 0) {
      orConditions.push({ bizRegNo: { in: bizRegNosToCheck } });
    }

    const existingRows =
      orConditions.length > 0
        ? await this.prisma.store.findMany({
            where: { OR: orConditions },
            select: { branchCode: true, bizRegNo: true },
          })
        : [];

    const existingBranchCodes = new Set(
      existingRows.map((row) => row.branchCode),
    );
    const existingBizRegNos = new Set(
      existingRows
        .map((row) => row.bizRegNo)
        .filter((no): no is string => Boolean(no)),
    );

    const seenBranchCodes = new Set<string>();
    const seenBizRegNos = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const row = i + 2;
      const dto = items[i];
      const rowErrors = await this.validateBulkRow(
        dto,
        row,
        seenBranchCodes,
        seenBizRegNos,
        existingBranchCodes,
        existingBizRegNos,
      );

      if (rowErrors.length > 0) {
        report.errors.push(...rowErrors);
        continue;
      }

      try {
        const created = await this.prisma.$transaction(async (tx) =>
          this.createStoreInTransaction(tx, dto),
        );
        report.createdIds.push(created.id);
        report.successCount += 1;
        existingBranchCodes.add(created.branchCode);
        seenBranchCodes.add(created.branchCode);
        if (created.bizRegNo) {
          existingBizRegNos.add(created.bizRegNo);
          seenBizRegNos.add(created.bizRegNo);
        }
      } catch (error: unknown) {
        const isDuplicate =
          error &&
          typeof error === 'object' &&
          'code' in error &&
          (error as { code: string }).code === 'P2002';

        report.errors.push({
          row,
          code: isDuplicate ? 'DUPLICATE' : 'UNKNOWN',
          message: isDuplicate
            ? '지점코드 또는 사업자등록번호가 이미 사용 중입니다.'
            : error instanceof Error
              ? error.message
              : '저장 중 알 수 없는 오류가 발생했습니다.',
        });
      }
    }

    report.failureCount = new Set(report.errors.map((e) => e.row)).size;
    return report;
  }

  private async validateBulkRow(
    dto: CreateStoreDto,
    row: number,
    seenBranchCodes: Set<string>,
    seenBizRegNos: Set<string>,
    existingBranchCodes: Set<string>,
    existingBizRegNos: Set<string>,
  ): Promise<BulkImportRowError[]> {
    const errors: BulkImportRowError[] = [];

    if (!dto.branchName?.trim()) {
      errors.push({
        row,
        field: 'branchName',
        code: 'REQUIRED',
        message: '지점명은 필수 입력 항목입니다.',
      });
    }

    if (!dto.ownerName?.trim()) {
      errors.push({
        row,
        field: 'ownerName',
        code: 'REQUIRED',
        message: '대표자명은 필수 입력 항목입니다.',
      });
    }

    if (dto.bizRegNo?.trim()) {
      if (!isValidBusinessRegNo(dto.bizRegNo)) {
        errors.push({
          row,
          field: 'bizRegNo',
          code: 'FORMAT',
          message: '사업자등록번호 형식이 올바르지 않습니다.',
        });
      } else {
        const normalized = normalizeBusinessRegNo(dto.bizRegNo);
        if (seenBizRegNos.has(normalized)) {
          errors.push({
            row,
            field: 'bizRegNo',
            code: 'DUPLICATE',
            message: '업로드 파일 내 사업자등록번호가 중복됩니다.',
          });
        } else if (existingBizRegNos.has(normalized)) {
          errors.push({
            row,
            field: 'bizRegNo',
            code: 'DUPLICATE',
            message: '이미 등록된 사업자등록번호입니다.',
          });
        } else {
          seenBizRegNos.add(normalized);
        }
      }
    }

    if (dto.branchCode?.trim()) {
      const code = dto.branchCode.trim();
      if (seenBranchCodes.has(code)) {
        errors.push({
          row,
          field: 'branchCode',
          code: 'DUPLICATE',
          message: '업로드 파일 내 지점코드가 중복됩니다.',
        });
      } else if (existingBranchCodes.has(code)) {
        errors.push({
          row,
          field: 'branchCode',
          code: 'DUPLICATE',
          message: '이미 등록된 지점코드입니다.',
        });
      } else {
        seenBranchCodes.add(code);
      }
    }

    if (errors.length === 0) {
      try {
        await this.validateMasterKeys(dto);
      } catch (error: unknown) {
        errors.push({
          row,
          code: 'FORMAT',
          message:
            error instanceof Error
              ? error.message
              : '마스터 코드 값이 유효하지 않습니다.',
        });
      }
    }

    return errors;
  }

  private async createStoreInTransaction(
    tx: Prisma.TransactionClient,
    dto: CreateStoreDto,
  ) {
    const branchCode =
      dto.branchCode?.trim() ||
      (await this.automation.generateBranchCode(tx));

    const initialContractDate = parseDate(dto.initialContractDate);
    const renewalContractDate = parseDate(dto.renewalContractDate);

    const computed = await this.automation.resolveComputedFields({
      initialContractDate,
      contractPeriodMonths: dto.contractPeriodMonths,
      renewalContractDate,
      terminationNoticePeriodKey: dto.terminationNoticePeriodKey,
    });

    const geo = await this.resolveGeo(
      dto.address,
      dto.latitude,
      dto.longitude,
    );

    return tx.store.create({
      data: mapCreateDtoToPrismaInput(dto, branchCode, computed, geo),
    });
  }
}
