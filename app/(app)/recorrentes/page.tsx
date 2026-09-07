import { getCategories, getRecurringItems } from "@/lib/data";
import { formatCurrency, PERSON_LABELS } from "@/lib/format";
import { RecurringItemForm } from "@/components/RecurringItemForm";
import {
  deleteRecurringItemAction,
  toggleRecurringActiveAction,
} from "./actions";

export default async function RecorrentesPage() {
  const [items, categories] = await Promise.all([
    getRecurringItems(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Contas fixas e recorrentes
      </h1>
      <p className="max-w-2xl text-sm text-slate-500">
        Cadastre aqui as contas que se repetem todo mês (academia, água,
        energia, condomínio, salários...). Elas geram automaticamente um
        lançamento por mês através do botão &quot;Gerar lançamentos fixos do
        mês&quot; no painel.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Nova conta fixa / recorrente
        </h2>
        <RecurringItemForm categories={categories} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Categoria</th>
              <th className="px-4 py-2 font-medium">Responsável</th>
              <th className="px-4 py-2 font-medium">Valor padrão</th>
              <th className="px-4 py-2 font-medium">Dia</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2 font-medium text-slate-800">
                  {item.name}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {item.category.name}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {PERSON_LABELS[item.person]}
                </td>
                <td
                  className={`px-4 py-2 font-medium ${
                    item.type === "INCOME" ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatCurrency(item.defaultAmount)}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {item.dayOfMonth ?? "-"}
                </td>
                <td className="px-4 py-2">
                  <form action={toggleRecurringActiveAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={String(item.active)}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.active ? "Ativa" : "Inativa"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteRecurringItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="font-medium text-rose-500 hover:text-rose-700"
                    >
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
