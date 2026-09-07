"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import {
  generateMonthlyTransactionsAction,
  type GenerateState,
} from "@/app/(app)/dashboard-actions";

export function GenerateRecurringButton({ month }: { month: string }) {
  const [state, formAction, pending] = useActionState<GenerateState, FormData>(
    generateMonthlyTransactionsAction,
    undefined
  );

  return (
    <div className="space-y-1">
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="month" value={month} />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-60"
        >
          <Sparkles size={16} />
          {pending ? "Gerando..." : "Gerar/atualizar lançamentos fixos deste mês"}
        </button>
        {state?.message && (
          <span className="text-sm text-slate-500">{state.message}</span>
        )}
      </form>
      <p className="text-xs text-slate-400">
        As contas fixas do mês atual já são geradas automaticamente ao abrir o
        painel. Use este botão para gerar de novo depois de cadastrar uma
        conta fixa nova, ou para outro mês.
      </p>
    </div>
  );
}
