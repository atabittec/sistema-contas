"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth";
import { ensureMonthlyTransactions } from "@/lib/data";

export type GenerateState = { message: string } | undefined;

export async function generateMonthlyTransactionsAction(
  _prevState: GenerateState,
  formData: FormData
): Promise<GenerateState> {
  await verifySession();
  const month = String(formData.get("month") ?? "");
  if (!month) return { message: "Mês inválido." };

  const created = await ensureMonthlyTransactions(month);
  revalidatePath("/");
  revalidatePath("/lancamentos");

  if (created === 0) {
    return {
      message:
        "Nenhum lançamento novo. Verifique se há contas fixas ativas cadastradas, ou se este mês já foi gerado.",
    };
  }

  return {
    message:
      created === 1
        ? "1 lançamento gerado com sucesso."
        : `${created} lançamentos gerados com sucesso.`,
  };
}
