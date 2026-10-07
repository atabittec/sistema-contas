import { getCategories, getCategoryTotalsForMonths } from "@/lib/data";
import { currentYear, formatCurrency, monthsInYear } from "@/lib/format";
import { CategoryForm } from "@/components/CategoryForm";
import { deleteCategoryAction } from "./actions";
import { EntryType } from "@prisma/client";

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const year = currentYear();
  const months = monthsInYear(year);

  const [categories, expenseTotals, incomeTotals] = await Promise.all([
    getCategories(),
    getCategoryTotalsForMonths(EntryType.EXPENSE, months),
    getCategoryTotalsForMonths(EntryType.INCOME, months),
  ]);

  const income = categories.filter((c) => c.type === "INCOME");
  const expense = categories.filter((c) => c.type === "EXPENSE");
  const totalsByCategory = new Map(
    [...expenseTotals, ...incomeTotals].map((t) => [t.categoryId, t.total])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Categorias</h1>

      {params.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <CategoryForm />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CategoryList
          title="Receitas"
          categories={income}
          totals={totalsByCategory}
          year={year}
        />
        <CategoryList
          title="Despesas"
          categories={expense}
          totals={totalsByCategory}
          year={year}
        />
      </div>
    </div>
  );
}

function CategoryList({
  title,
  categories,
  totals,
  year,
}: {
  title: string;
  categories: { id: string; name: string }[];
  totals: Map<string, number>;
  year: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        {title}{" "}
        <span className="font-normal text-slate-400">em {year}</span>
      </h2>
      <ul className="divide-y divide-slate-100">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-slate-800">{c.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {totals.get(c.id) ? formatCurrency(totals.get(c.id)!) : "—"}
              </span>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-rose-500 hover:text-rose-700"
                >
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="py-2 text-sm text-slate-500">Nenhuma categoria.</li>
        )}
      </ul>
    </div>
  );
}
