import { prisma } from "@/shared/lib/prisma";
import type { Franchise } from "@/domains/franchise/types";

export type GetFranchisesResult = {
  franchises: Franchise[];
  error?: string;
};

export async function getFranchises(): Promise<GetFranchisesResult> {
  if (!process.env.DATABASE_URL) {
    return {
      franchises: [],
      error: "DATABASE_URL 환경 변수가 설정되지 않았습니다. Vercel 프로젝트 설정에서 DB 연결 문자열을 추가해 주세요.",
    };
  }

  try {
    const franchises = await prisma.franchise.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      franchises: franchises.map((franchise) => ({
        id: franchise.id,
        code: franchise.code,
        name: franchise.name,
        status: franchise.status as Franchise["status"],
        contact: franchise.ownerName ?? null,
        openedAt: franchise.openedAt?.toISOString() ?? null,
        createdAt: franchise.createdAt.toISOString(),
        updatedAt: franchise.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getFranchises]", error);
    return {
      franchises: [],
      error:
        "데이터베이스에 연결할 수 없습니다. DATABASE_URL 확인 후 Prisma 마이그레이션(npx prisma migrate deploy)을 실행해 주세요.",
    };
  }
}
