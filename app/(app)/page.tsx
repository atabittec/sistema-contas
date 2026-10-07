import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Clock, Scale } from "lucide-react";
import {
  ensureMonthlyTransactions,
  getExpenseByCategory,
  getIncomeByPersonSeries,
  getMonthIncomeByPerson,
  getMonthSummary,
  getMonthlySeries,
  getPendingExpenses,
} from "@/lib/data";
import {
  currentCompetenceMonth,
  formatCurrency,
  formatDueDate,
  todayInBrazil,
} from "@/lib/format";
import { IncomeByPersonChart } from "@/components/charts/IncomeByPersonChart";
import { togglePaidAction } from "./lancamentos/actions";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { GenerateRecurringButton } from "@/components/GenerateRecurringButton";
import { SummaryCard } from "@/components/SummaryCard";
import { PersonIncomeTable } from "@/components/PersonIncomeTable";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentCompetenceMonth();

  if (month === currentCompetenceMonth()) {
    await ensureMonthlyTransactions(month);
  }

  const [summary, series, categories, pending, personSeries, personIncome] =
    await Promise.all([
      getMonthSummary(month),
      getMonthlySeries(12),
      getExpenseByCategory(month),
      getPendingExpenses(month),
      getIncomeByPersonSeries(12),
      getMonthIncomeByPerson(month),
    ]);

  const balancePositive = summary.balance >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Painel</h1>
        <MonthSwitcher month={month} basePath="/" />
      </div>

      <GenerateRecurringButton month={month} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <SummaryCard
          label="A pagar"
          value={pending.total}
          tone="pending"
          icon={Clock}
        />
      </div>

      <PendingList month={month} items={pending.items} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Entradas x Saídas (últimos 12 meses)
        </h2>
        <IncomeExpenseChart data={series} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Entradas por pessoa (últimos 12 meses)
        </h2>
        {personSeries.every((d) => d.ANDRE + d.USUARIA + d.CASAL === 0) ? (
          <p className="text-sm text-slate-500">
            Nenhuma entrada lançada nos últimos 12 meses.
          </p>
        ) : (
          <>
            <IncomeByPersonChart data={personSeries} />
            {personIncome.people.length > 0 && (
              <PersonIncomeTable data={personIncome} caption="Entradas deste mês" />
            )}
          </>
        )}
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

const PENDING_LIMIT = 8;

function PendingList({
  month,
  items,
}: {
  month: string;
  items: Awaited<ReturnType<typeof getPendingExpenses>>["items"];
}) {
  const today = todayInBrazil();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-700">Contas a pagar</h2>
        {items.length > 0 && (
          <Link
            href={`/lancamentos?month=${month}&type=EXPENSE`}
            className="text-sm font-medium text-brand hover:text-brand-dark"
          >
            Ver todas
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Tudo pago neste mês.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.slice(0, PENDING_LIMIT).map((t) => {
            const due = dueStatus(t.dueDate, today);
            return (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">
                    {t.description}
                  </p>
                  <p className={`text-xs ${due.className}`}>{due.label}</p>
                </div>
                <span className="font-medium text-rose-700">
                  {formatCurrency(t.amount)}
                </span>
                <form action={togglePaidAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="paid" value="false" />
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Marcar pago
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > PENDING_LIMIT && (
        <p className="mt-2 text-xs text-slate-400">
          E mais {items.length - PENDING_LIMIT} conta(s) pendente(s).
        </p>
      )}
    </section>
  );
}

function dueStatus(dueDate: Date | null, today: string) {
  if (!dueDate) {
    return { label: "Sem vencimento", className: "text-slate-400" };
  }
  const due = dueDate.toISOString().slice(0, 10);
  const days = Math.round(
    (Date.parse(due) - Date.parse(today)) / (24 * 60 * 60 * 1000)
  );
  const date = formatDueDate(dueDate);

  if (days < 0) {
    return {
      label: `Venceu em ${date} (${-days} dia${days === -1 ? "" : "s"} atrás)`,
      className: "font-medium text-rose-600",
    };
  }
  if (days === 0) {
    return { label: `Vence hoje (${date})`, className: "font-medium text-amber-600" };
  }
  if (days <= 7) {
    return {
      label: `Vence em ${days} dia${days === 1 ? "" : "s"} (${date})`,
      className: "text-amber-600",
    };
  }
  return { label: `Vence em ${date}`, className: "text-slate-400" };
}
