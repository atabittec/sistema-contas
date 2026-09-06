import {
  getExpenseByCategory,
  getMonthSummary,
  getMonthlySeries,
} from "@/lib/data";
import { currentCompetenceMonth, formatCurrency } from "@/lib/format";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { generateMonthlyTransactionsAction } from "./dashboard-actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentCompetenceMonth();

  const [summary, series, categories] = await Promise.all([
    getMonthSummary(month),
    getMonthlySeries(12),
    getExpenseByCategory(month),
  ]);

  const balancePositive = summary.balance >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-900">Painel</h1>
        <MonthSwitcher month={month} basePath="/" />
      </div>

      <form action={generateMonthlyTransactionsAction}>
        <input type="hidden" name="month" value={month} />
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          Gerar lançamentos fixos do mês
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Entradas" value={summary.income} tone="income" />
        <SummaryCard label="Saídas" value={summary.expense} tone="expense" />
        <SummaryCard
          label="Saldo"
          value={summary.balance}
          tone={balancePositive ? "income" : "expense"}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Entradas x Saídas (últimos 12 meses)
        </h2>
        <IncomeExpenseChart data={series} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Gastos por categoria no mês
        </h2>
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum gasto lançado neste mês ainda.
          </p>
        ) : (
          <CategoryBarChart data={categories} />
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          tone === "income" ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
