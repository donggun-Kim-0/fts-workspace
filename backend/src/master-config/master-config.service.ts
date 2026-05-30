import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CATEGORY_LABELS,
  MASTER_CONFIG_CATEGORY_LIST,
  MasterConfigCategory,
  STORE_FORM_CONFIG_CATEGORIES,
} from '../shared/constants/master-config-categories';
import { MasterConfigCache } from './master-config-cache';
import { buildStoreReferenceWhere } from './master-config-reference.util';
import { CreateMasterConfigDto } from './dto/create-master-config.dto';
import { UpdateMasterConfigDto } from './dto/update-master-config.dto';

export type MasterConfigUsage = {
  storeCount: number;
  category: string;
  key: string;
  canDelete: boolean;
};

@Injectable()
export class MasterConfigService {
  private readonly cache = new MasterConfigCache(60_000);

  constructor(private readonly prisma: PrismaService) {}

  assertCategory(category: string): asserts category is MasterConfigCategory {
    if (!MASTER_CONFIG_CATEGORY_LIST.includes(category as MasterConfigCategory)) {
      throw new BadRequestException(
        `유효하지 않은 category입니다. 허용: ${MASTER_CONFIG_CATEGORY_LIST.join(', ')}`,
      );
    }
  }

  listCategories() {
    return MASTER_CONFIG_CATEGORY_LIST.map((category) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category.replace(/_/g, ' '),
    }));
  }

  async findAll(category?: string, activeOnly = true) {
    if (category) {
      this.assertCategory(category);
    }

    const cacheKey = this.cache.cacheKey(category, activeOnly);
    const cached = this.cache.get<Awaited<ReturnType<typeof this.fetchAll>>>(cacheKey);
    if (cached) return cached;

    const rows = await this.fetchAll(category, activeOnly);
    this.cache.set(cacheKey, rows);
    return rows;
  }

  private fetchAll(category?: string, activeOnly = true) {
    return this.prisma.masterConfig.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async findByCategory(category: string, activeOnly = true) {
    this.assertCategory(category);
    return this.findAll(category, activeOnly);
  }

  async findOne(id: number) {
    const row = await this.prisma.masterConfig.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`MasterConfig ID ${id}를 찾을 수 없습니다.`);
    }
    return row;
  }

  /** 가맹점 등록 폼용 — category별 options 일괄 (캐시) */
  async getFormOptions() {
    const cacheKey = this.cache.formOptionsKey();
    const cached = this.cache.get<Record<string, { key: string; value: string }[]>>(cacheKey);
    if (cached) return cached;

    const rows = await this.prisma.masterConfig.findMany({
      where: {
        category: { in: [...STORE_FORM_CONFIG_CATEGORIES] },
        isActive: true,
      },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      select: { category: true, key: true, value: true },
    });

    const grouped: Record<string, { key: string; value: string }[]> = {};
    for (const cat of STORE_FORM_CONFIG_CATEGORIES) {
      grouped[cat] = [];
    }
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push({ key: row.key, value: row.value });
    }

    this.cache.set(cacheKey, grouped);
    return grouped;
  }

  async assertActiveKey(category: string, key: string | null | undefined) {
    if (!key) return;

    this.assertCategory(category);
    const row = await this.prisma.masterConfig.findFirst({
      where: { category, key, isActive: true },
    });

    if (!row) {
      throw new BadRequestException(
        `MasterConfig [${category}/${key}] 가 없거나 비활성입니다.`,
      );
    }
  }

  async getNoticePeriodDays(key: string | null | undefined): Promise<number> {
    if (!key) return 90;

    await this.assertActiveKey('TERMINATION_NOTICE_PERIOD', key);

    const days = Number.parseInt(key, 10);
    if (Number.isNaN(days) || days < 0) {
      throw new BadRequestException(
        'TERMINATION_NOTICE_PERIOD key는 0 이상의 일수(문자열)여야 합니다.',
      );
    }
    return days;
  }

  async countStoreReferences(category: string, key: string): Promise<number> {
    const where = buildStoreReferenceWhere(category, key);
    if (!where) return 0;
    return this.prisma.store.count({ where });
  }

  async getUsage(id: number): Promise<MasterConfigUsage> {
    const row = await this.findOne(id);
    const storeCount = await this.countStoreReferences(row.category, row.key);
    return {
      storeCount,
      category: row.category,
      key: row.key,
      canDelete: storeCount === 0,
    };
  }

  async create(dto: CreateMasterConfigDto) {
    this.assertCategory(dto.category);

    const existing = await this.prisma.masterConfig.findFirst({
      where: { category: dto.category, key: dto.key },
    });
    if (existing) {
      throw new ConflictException(
        `동일한 category/key가 이미 존재합니다: ${dto.category}/${dto.key}`,
      );
    }

    const created = await this.prisma.masterConfig.create({
      data: {
        category: dto.category,
        key: dto.key,
        value: dto.value,
        isActive: dto.isActive ?? true,
      },
    });

    this.cache.invalidateAll();
    return created;
  }

  async update(id: number, dto: UpdateMasterConfigDto) {
    const existing = await this.findOne(id);

    if (dto.category) {
      this.assertCategory(dto.category);
    }

    if (dto.key && dto.key !== existing.key) {
      const usage = await this.countStoreReferences(existing.category, existing.key);
      if (usage > 0) {
        throw new ConflictException(
          `이 코드를 참조하는 가맹점이 ${usage}건 있어 key를 변경할 수 없습니다.`,
        );
      }
    }

    const updated = await this.prisma.masterConfig.update({
      where: { id },
      data: {
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.key !== undefined && { key: dto.key }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.cache.invalidateAll();
    return updated;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    const storeCount = await this.countStoreReferences(row.category, row.key);

    if (storeCount > 0) {
      throw new ConflictException(
        `이 코드(${row.category}/${row.key})를 사용 중인 가맹점이 ${storeCount}건 있습니다. 삭제할 수 없습니다.`,
      );
    }

    const updated = await this.prisma.masterConfig.update({
      where: { id },
      data: { isActive: false },
    });

    this.cache.invalidateAll();
    return updated;
  }
}
