import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MasterConfigService } from '../master-config/master-config.service';

export type StoreDateInput = {
  initialContractDate?: Date | null;
  /** DB 필드 없음 — 만료일 계산용 기본 36개월 */
  contractPeriodMonths?: number;
  renewalContractDate?: Date | null;
  terminationNoticePeriodKey?: string | null;
};

@Injectable()
export class StoreAutomationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masterConfig: MasterConfigService,
  ) {}

  async generateBranchCode(tx: Prisma.TransactionClient): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const datePart = `${y}${m}${d}`;
    const prefix = `ST-${datePart}-`;

    const last = await tx.store.findFirst({
      where: { branchCode: { startsWith: prefix } },
      orderBy: { branchCode: 'desc' },
      select: { branchCode: true },
    });

    let seq = 1;
    if (last?.branchCode) {
      const match = last.branchCode.match(/-(\d{3})$/);
      if (match) {
        seq = Number.parseInt(match[1], 10) + 1;
      }
    }

    if (seq > 999) {
      throw new Error(`일일 지점코드 한도(999) 초과: ${prefix}`);
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  computeExpireDate(input: StoreDateInput): Date | null {
    const { initialContractDate, contractPeriodMonths, renewalContractDate } =
      input;

    if (renewalContractDate) {
      const expiry = new Date(renewalContractDate);
      expiry.setDate(expiry.getDate() + 365);
      return expiry;
    }

    if (!initialContractDate) {
      return null;
    }

    const months = contractPeriodMonths ?? 36;
    const expiry = new Date(initialContractDate);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  }

  async computeTerminateNoticeDate(
    expireDate: Date | null,
    terminationNoticePeriodKey?: string | null,
  ): Promise<Date | null> {
    if (!expireDate) {
      return null;
    }

    const days = await this.masterConfig.getNoticePeriodDays(
      terminationNoticePeriodKey,
    );

    const notice = new Date(expireDate);
    notice.setDate(notice.getDate() - days);
    return notice;
  }

  async resolveComputedFields(input: StoreDateInput) {
    const expireDate = this.computeExpireDate(input);
    const terminateNoticeDate = await this.computeTerminateNoticeDate(
      expireDate,
      input.terminationNoticePeriodKey,
    );

    return { expireDate, terminateNoticeDate };
  }
}
