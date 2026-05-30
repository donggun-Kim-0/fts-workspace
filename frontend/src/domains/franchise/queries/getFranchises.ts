import { apiRequest } from '@/lib/api/client';
import type { Franchise } from '@/domains/franchise/types';

export type GetFranchisesResult = {
  franchises: Franchise[];
  error?: string;
};

type FranchiseApiRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  ownerName?: string | null;
  openedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getFranchises(): Promise<GetFranchisesResult> {
  try {
    const rows = await apiRequest<FranchiseApiRow[]>('/franchises');
    const franchises = (Array.isArray(rows) ? rows : []).map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      status: row.status as Franchise['status'],
      contact: row.ownerName ?? null,
      openedAt: row.openedAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
    return { franchises };
  } catch {
    return {
      franchises: [],
      error:
        '본사 가맹점 API(/franchises)가 아직 백엔드에 없습니다. Store MDM은 /admin/stores에서 이용하세요.',
    };
  }
}
