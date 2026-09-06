"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Person } from "@prisma/client";

const TransactionSchema = z.object({
  description: z.string().trim().min(1, "Informe uma descrição."),
  amount: z.coerce.number().positive("O valor deve ser maior que zero."),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  person: z.nativeEnum(Person),
  competenceMonth: z.string().regex(/^\d{4}-\d{2}$/, "Mês inválido."),
  dueDate: z.string().optional(),
  cardName: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  paid: z.coerce.boolean().optional(),
});

function parseTransactionForm(formData: FormData) {
  return TransactionSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    person: formData.get("person"),
    competenceMonth: formData.get("competenceMonth"),
    dueDate: formData.get("dueDate") || undefined,
    cardName: formData.get("cardName") || undefined,
    notes: formData.get("notes") || undefined,
    paid: formData.get("paid") === "on",
  });
}

export type TransactionFormState = { error?: string } | undefined;

export async function createTransactionAction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  await verifySession();
  const parsed = parseTransactionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return { error: "Categoria não encontrada." };
  }

  await prisma.transaction.create({
    data: {
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: category.type,
      categoryId: category.id,
      person: parsed.data.person,
      competenceMonth: parsed.data.competenceMonth,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      cardName: parsed.data.cardName || null,
      notes: parsed.data.notes || null,
      paid: parsed.data.paid ?? false,
    },
  });

  revalidatePath("/lancamentos");
  revalidatePath("/");
  revalidatePath("/cartoes");
  redirect(`/lancamentos?month=${parsed.data.competenceMonth}`);
}

export async function updateTransactionAction(
  id: string,
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  await verifySession();
  const parsed = parseTransactionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return { error: "Categoria não encontrada." };
  }

  await prisma.transaction.update({
    where: { id },
    data: {
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: category.type,
      categoryId: category.id,
      person: parsed.data.person,
      competenceMonth: parsed.data.competenceMonth,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      cardName: parsed.data.cardName || null,
      notes: parsed.data.notes || null,
      paid: parsed.data.paid ?? false,
    },
  });

  revalidatePath("/lancamentos");
  revalidatePath("/");
  revalidatePath("/cartoes");
  redirect(`/lancamentos?month=${parsed.data.competenceMonth}`);
}

export async function deleteTransactionAction(formData: FormData) {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  const month = String(formData.get("month") ?? "");
  if (!id) return;

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/lancamentos");
  revalidatePath("/");
  revalidatePath("/cartoes");
  if (month) redirect(`/lancamentos?month=${month}`);
}

export async function togglePaidAction(formData: FormData) {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  const paid = formData.get("paid") === "true";
  if (!id) return;

  await prisma.transaction.update({
    where: { id },
    data: { paid: !paid },
  });

  revalidatePath("/lancamentos");
  revalidatePath("/");
}
