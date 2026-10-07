import { ArrowDownCircle, ArrowUpCircle, Download, Scale } from "lucide-react";
import {
  getCardMonthlyHistory,
  getCategories,
  getCategoryMonthlyHistory,
  getCategoryTotalsForMonths,
  getIncomeByPersonForMonths,
  getIncomeByPersonSeriesForMonths,
  getSeriesForMonths,
  getSummaryForMonths,
} from "@/lib/data";
import {
  currentYear,
  formatCurrency,
  monthsInYear,
  monthTickLabel,
} from "@/lib/format";
import { EntryType } from "@prisma/client";
import { YearSwitcher } from "@/components/YearSwitcher";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { IncomeByPersonChart } from "@/components/charts/IncomeByPersonChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { CategoryHistoryChart } from "@/components/charts/CategoryHistoryChart";
import { SummaryCard } from "@/components/SummaryCard";
import { PersonIncomeTable } from "@/components/PersonIncomeTable";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; categoryId?: string }>;
}) {
  const params = await searchParams;
  const year = Number(params.year) || currentYear();
  const months = monthsInYear(year);

  const [
    summary,
    series,
    personSeries,
    personIncome,
    expenseCategories,
    allCategories,
    cardHistory,
  ] = await Promise.all([
    getSummaryForMonths(months),
    getSeriesForMonths(months),
    getIncomeByPersonSeriesForMonths(months),
    getIncomeByPersonForMonths(months),
    getCategoryTotalsForMonths(EntryType.EXPENSE, months),
    getCategories(),
    getCardMonthlyHistory(months),
  ]);

  const selectedCategoryId = params.categoryId || expenseCategories[0]?.categoryId;
  const categoryHistory = selectedCategoryId
    ? await getCategoryMonthlyHistory(selectedCategoryId, months)
    : [];
  const selectedCategory = allCategories.find((c) => c.id === selectedCategoryId);

  const balancePositive = summary.balance >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Relatórios</h1>
        <div className="flex items-center gap-2">
          <YearSwitcher year={year} basePath="/relatorios" />
          <a
            href={`/api/export?year=${year}`}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Download size={16} />
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label={`Entradas em ${year}`}
          value={summary.income}
          tone="income"
          icon={ArrowUpCircle}
        />
        <SummaryCard
          label={`Saídas em ${year}`}
          value={summary.expense}
          tone="expense"
          icon={ArrowDownCircle}
        />
        <SummaryCard
          label={`Saldo de ${year}`}
          value={summary.balance}
          tone={balancePositive ? "income" : "expense"}
          icon={Scale}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Entradas x Saídas mês a mês em {year}
        </h2>
        <IncomeExpenseChart data={series} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Evolução de uma categoria em {year}
        </h2>
        <form className="mb-4 flex flex-wrap items-center gap-2" method="get">
          <input type="hidden" name="year" value={year} />
          <select
            name="categoryId"
            defaultValue={selectedCategoryId ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === "INCOME" ? "receita" : "despesa"})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand/40 hover:text-brand"
          >
            Ver
          </button>
        </form>
        {!selectedCategoryId ? (
          <p className="text-sm text-slate-500">
            Nenhuma categoria com lançamentos em {year}.
          </p>
        ) : categoryHistory.every((d) => d.total === 0) ? (
          <p className="text-sm text-slate-500">
            Nenhum lançamento em &quot;{selectedCategory?.name}&quot; em {year}.
          </p>
        ) : (
          <CategoryHistoryChart data={categoryHistory} />
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Gastos por categoria em {year}
        </h2>
        {expenseCategories.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum gasto lançado em {year}.</p>
        ) : (
          <CategoryBarChart data={expenseCategories} />
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Entradas por pessoa em {year}
        </h2>
        {personSeries.every((d) => d.ANDRE + d.USUARIA + d.CASAL === 0) ? (
          <p className="text-sm text-slate-500">
            Nenhuma entrada lançada em {year}.
          </p>
        ) : (
          <IncomeByPersonChart data={personSeries} />
        )}
        <PersonIncomeTable data={personIncome} caption={`Entradas de ${year}`} />
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Cartões mês a mês em {year}
        </h2>
        {cardHistory.cards.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma fatura de cartão lançada em {year}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Cartão</th>
                {months.map((m) => (
                  <th key={m} className="py-2 pr-3 text-right capitalize">
                    {monthTickLabel(m)}
                  </th>
                ))}
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cardHistory.cards.map((c) => (
                <tr key={c.cardName} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-4 font-medium text-slate-800">
                    {c.cardName}
                  </td>
                  {months.map((m) => (
                    <td key={m} className="py-2 pr-3 text-right text-slate-600">
                      {c.byMonth[m] > 0 ? formatCurrency(c.byMonth[m]) : "—"}
                    </td>
                  ))}
                  <td className="py-2 text-right font-medium text-slate-900">
                    {formatCurrency(c.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
