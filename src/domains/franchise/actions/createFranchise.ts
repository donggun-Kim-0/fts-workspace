"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";

const createFranchiseSchema = z.object({
  name: z.string().min(2, "가맹점명은 2자 이상이어야 합니다."),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "CLOSED"]),
  contact: z.string().min(8, "연락처는 8자 이상 입력해 주세요."),
});

export type CreateFranchiseState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    status?: string[];
    contact?: string[];
  };
};

const initialState: CreateFranchiseState = {
  success: false,
};

export async function createFranchise(
  _prevState: CreateFranchiseState = initialState,
  formData: FormData,
): Promise<CreateFranchiseState> {
  const parsed = createFranchiseSchema.safeParse({
    name: formData.get("name"),
    status: formData.get("status"),
    contact: formData.get("contact"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "입력값을 확인해 주세요.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, status, contact } = parsed.data;
  const normalizedName = name.trim();

  await prisma.franchise.create({
    data: {
      name: normalizedName,
      status,
      ownerName: contact.trim(),
      code: `FC-${Date.now().toString().slice(-8)}`,
    },
  });

  revalidatePath("/franchise");
  return {
    success: true,
    message: "가맹점이 등록되었습니다.",
  };
}
