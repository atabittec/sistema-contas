import Link from "next/link";
import { getCategories, getTransactions } from "@/lib/data";
import { currentCompetenceMonth, formatCurrency, PERSON_LABELS } from "@/lib/format";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { deleteTransactionAction, togglePaidAction } from "./actions";
import { Person, EntryType } from "@prisma/client";

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    person?: string;
    categoryId?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentCompetenceMonth();
  const person = params.person as Person | undefined;
  const categoryId = params.categoryId || undefined;
  const type = params.type as EntryType | undefined;

  const [transactions, categories] = await Promise.all([
    getTransactions({ competenceMonth: month, person, categoryId, type }),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-900">Lançamentos</h1>
        <MonthSwitcher month={month} basePath="/lancamentos" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap gap-2" action="/lancamentos" method="get">
          <input type="hidden" name="month" value={month} />
          <select
            name="type"
            defaultValue={type ?? ""}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
          <select
            name="person"
            defaultValue={person ?? ""}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="CASAL">Casal</option>
            <option value="ANDRE">André</option>
            <option value="USUARIA">Usuária</option>
          </select>
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Filtrar
          </button>
        </form>

        <Link
          href={`/lancamentos/novo?month=${month}`}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Descrição</th>
              <th className="px-4 py-2 font-medium">Categoria</th>
              <th className="px-4 py-2 font-medium">Responsável</th>
              <th className="px-4 py-2 font-medium">Valor</th>
              <th className="px-4 py-2 font-medium">Pago?</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Nenhum lançamento neste mês com esses filtros.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-800">{t.description}</div>
                  {t.cardName && (
                    <div className="text-xs text-slate-400">{t.cardName}</div>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-600">{t.category.name}</td>
                <td className="px-4 py-2 text-slate-600">
                  {PERSON_LABELS[t.person]}
                </td>
                <td
                  className={`px-4 py-2 font-medium ${
                    t.type === "INCOME" ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {t.type === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-4 py-2">
                  <form action={togglePaidAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="paid" value={String(t.paid)} />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.paid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.paid ? "Pago" : "Pendente"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/lancamentos/${t.id}`}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Editar
                    </Link>
                    <form action={deleteTransactionAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="month" value={month} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
