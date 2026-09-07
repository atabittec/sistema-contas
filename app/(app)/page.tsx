import { ArrowDownCircle, ArrowUpCircle, Scale, Sparkles } from "lucide-react";
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
        <h1 className="text-xl font-semibold text-slate-900">Painel</h1>
        <MonthSwitcher month={month} basePath="/" />
      </div>

      <form action={generateMonthlyTransactionsAction}>
        <input type="hidden" name="month" value={month} />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand/40 hover:text-brand"
        >
          <Sparkles size={16} />
          Gerar lançamentos fixos do mês
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Entradas"
          value={summary.income}
          tone="income"
          icon={ArrowUpCircle}
        />
        <SummaryCard
          label="Saídas"
          value={summary.expense}
          tone="expense"
          icon={ArrowDownCircle}
        />
        <SummaryCard
          label="Saldo"
          value={summary.balance}
          tone={balancePositive ? "income" : "expense"}
          icon={Scale}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Entradas x Saídas (últimos 12 meses)
        </h2>
        <IncomeExpenseChart data={series} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
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
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
  icon: React.ComponentType<{ size?: number }>;
}) {
  const isIncome = tone === "income";
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        }`}
      >
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p
          className={`mt-0.5 text-2xl font-semibold ${
            isIncome ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}
