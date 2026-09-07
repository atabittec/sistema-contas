"use client";

import { useActionState } from "react";
import type { Category } from "@prisma/client";
import type { TransactionFormState } from "@/app/(app)/lancamentos/actions";

type DefaultValues = {
  description?: string;
  amount?: number;
  categoryId?: string;
  person?: string;
  competenceMonth?: string;
  dueDate?: string;
  cardName?: string;
  notes?: string;
  paid?: boolean;
};

export function TransactionForm({
  action,
  categories,
  defaultValues,
  submitLabel = "Salvar",
}: {
  action: (
    state: TransactionFormState,
    formData: FormData
  ) => Promise<TransactionFormState>;
  categories: Category[];
  defaultValues?: DefaultValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <input
          name="description"
          defaultValue={defaultValues?.description}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Valor (R$)
        </label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={defaultValues?.amount}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Categoria
        </label>
        <select
          name="categoryId"
          defaultValue={defaultValues?.categoryId}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="" disabled>
            Selecione...
          </option>
          <optgroup label="Receitas">
            {categories
              .filter((c) => c.type === "INCOME")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Despesas">
            {categories
              .filter((c) => c.type === "EXPENSE")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Responsável
        </label>
        <select
          name="person"
          defaultValue={defaultValues?.person ?? "CASAL"}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="CASAL">Casal</option>
          <option value="ANDRE">André</option>
          <option value="USUARIA">Usuária</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Mês de competência
        </label>
        <input
          name="competenceMonth"
          type="month"
          defaultValue={defaultValues?.competenceMonth}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Vencimento (opcional)
        </label>
        <input
          name="dueDate"
          type="date"
          defaultValue={defaultValues?.dueDate}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Cartão (se for fatura, opcional)
        </label>
        <input
          name="cardName"
          defaultValue={defaultValues?.cardName}
          placeholder="Ex: Nubank, Itaú..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Observações (opcional)
        </label>
        <input
          name="notes"
          defaultValue={defaultValues?.notes}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="paid"
          name="paid"
          type="checkbox"
          defaultChecked={defaultValues?.paid}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="paid" className="text-sm text-slate-700">
          Já pago / recebido
        </label>
      </div>

      {state?.error && (
        <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
