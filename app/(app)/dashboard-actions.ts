"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth";
import { ensureMonthlyTransactions } from "@/lib/data";

export async function generateMonthlyTransactionsAction(formData: FormData) {
  await verifySession();
  const month = String(formData.get("month") ?? "");
  if (!month) return;
  await ensureMonthlyTransactions(month);
  revalidatePath("/");
  revalidatePath("/lancamentos");
}
