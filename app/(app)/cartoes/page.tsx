import Link from "next/link";
import { getCardTotals, getTransactions } from "@/lib/data";
import { currentCompetenceMonth, formatCurrency } from "@/lib/format";
import { MonthSwitcher } from "@/components/MonthSwitcher";

export default async function CartoesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentCompetenceMonth();

  const [totals, transactions] = await Promise.all([
    getCardTotals(month),
    getTransactions({ competenceMonth: month }),
  ]);

  const cardTransactions = transactions.filter((t) => t.cardName);
  const grandTotal = totals.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Cartões</h1>
        <MonthSwitcher month={month} basePath="/cartoes" />
      </div>

      <p className="max-w-2xl text-sm text-slate-500">
        Lance a fatura de cada cartão com o valor total em{" "}
        <Link href={`/lancamentos/novo?month=${month}`} className="underline">
          Novo lançamento
        </Link>
        , preenchendo o campo &quot;Cartão&quot;. Não é necessário detalhar por
        categoria.
      </p>

      {totals.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhuma fatura de cartão lançada neste mês ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {totals.map((c) => (
            <div
              key={c.cardName}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{c.cardName}</p>
              <p className="mt-1 text-xl font-semibold text-rose-700">
                {formatCurrency(c.total)}
              </p>
            </div>
          ))}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Total em cartões</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2 font-medium">Cartão</th>
              <th className="px-4 py-2 font-medium">Descrição</th>
              <th className="px-4 py-2 font-medium">Valor</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {cardTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Nenhum lançamento de cartão neste mês.
                </td>
              </tr>
            )}
            {cardTransactions.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2 text-slate-800">{t.cardName}</td>
                <td className="px-4 py-2 text-slate-600">{t.description}</td>
                <td className="px-4 py-2 font-medium text-rose-700">
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/lancamentos/${t.id}`}
                    className="font-medium text-brand hover:text-brand-dark"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
