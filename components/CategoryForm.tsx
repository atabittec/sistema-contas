"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  type CategoryFormState,
} from "@/app/(app)/categorias/actions";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState<
    CategoryFormState,
    FormData
  >(createCategoryAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Nome</label>
        <input
          name="name"
          required
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Tipo</label>
        <select
          name="type"
          defaultValue="EXPENSE"
          className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Adicionar categoria"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
