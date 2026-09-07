"use client";

import { useActionState } from "react";
import type { Category } from "@prisma/client";
import {
  createRecurringItemAction,
  type RecurringFormState,
} from "@/app/(app)/recorrentes/actions";

export function RecurringItemForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<
    RecurringFormState,
    FormData
  >(createRecurringItemAction, undefined);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">Nome</label>
        <input
          name="name"
          required
          placeholder="Ex: Academia"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Categoria
        </label>
        <select
          name="categoryId"
          required
          defaultValue=""
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
          defaultValue="CASAL"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="CASAL">Casal</option>
          <option value="ANDRE">André</option>
          <option value="USUARIA">Usuária</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Valor padrão (R$)
        </label>
        <input
          name="defaultAmount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Dia de vencimento (opcional)
        </label>
        <input
          name="dayOfMonth"
          type="number"
          min="1"
          max="28"
          placeholder="Ex: 10"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {state?.error && (
        <p className="sm:col-span-2 lg:col-span-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
