"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { EntryType, Prisma } from "@prisma/client";

const CategorySchema = z.object({
  name: z.string().trim().min(1, "Informe um nome."),
  type: z.nativeEnum(EntryType),
});

export type CategoryFormState = { error?: string } | undefined;

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await verifySession();
  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "Já existe uma categoria com esse nome e tipo." };
    }
    throw e;
  }

  revalidatePath("/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2003" || e.code === "P2014")
    ) {
      redirect(
        "/categorias?error=" +
          encodeURIComponent(
            "Não é possível excluir: já existem lançamentos ou contas fixas usando essa categoria."
          )
      );
    }
    throw e;
  }

  revalidatePath("/categorias");
}
