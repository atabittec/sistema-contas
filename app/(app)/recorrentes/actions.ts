"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Person } from "@prisma/client";

const RecurringSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome."),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  defaultAmount: z.coerce.number().positive("O valor deve ser maior que zero."),
  dayOfMonth: z.coerce.number().min(1).max(28).optional(),
  person: z.nativeEnum(Person),
});

export type RecurringFormState = { error?: string } | undefined;

export async function createRecurringItemAction(
  _prevState: RecurringFormState,
  formData: FormData
): Promise<RecurringFormState> {
  await verifySession();

  const dayOfMonthRaw = formData.get("dayOfMonth");
  const parsed = RecurringSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    defaultAmount: formData.get("defaultAmount"),
    dayOfMonth: dayOfMonthRaw ? dayOfMonthRaw : undefined,
    person: formData.get("person"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) return { error: "Categoria não encontrada." };

  await prisma.recurringItem.create({
    data: {
      name: parsed.data.name,
      type: category.type,
      categoryId: category.id,
      defaultAmount: parsed.data.defaultAmount,
      dayOfMonth: parsed.data.dayOfMonth ?? null,
      person: parsed.data.person,
    },
  });

  revalidatePath("/recorrentes");
}

export async function toggleRecurringActiveAction(formData: FormData) {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  await prisma.recurringItem.update({
    where: { id },
    data: { active: !active },
  });

  revalidatePath("/recorrentes");
}

export async function deleteRecurringItemAction(formData: FormData) {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.recurringItem.delete({ where: { id } });

  revalidatePath("/recorrentes");
}
