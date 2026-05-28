import { prisma } from "@/shared/lib/prisma";
import type { Franchise } from "@/domains/franchise/types";

export async function getFranchises(): Promise<Franchise[]> {
  const franchises = await prisma.franchise.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return franchises.map((franchise) => ({
    id: franchise.id,
    code: franchise.code,
    name: franchise.name,
    status: franchise.status as Franchise["status"],
    contact: franchise.ownerName ?? null,
    openedAt: franchise.openedAt?.toISOString() ?? null,
    createdAt: franchise.createdAt.toISOString(),
    updatedAt: franchise.updatedAt.toISOString(),
  }));
}
