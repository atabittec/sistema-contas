import { formatCurrency, PERSON_LABELS } from "@/lib/format";
import { PERSON_COLORS } from "@/lib/chart-colors";
import type { getIncomeByPersonForMonths } from "@/lib/data";

export function PersonIncomeTable({
  data,
  caption,
}: {
  data: Awaited<ReturnType<typeof getIncomeByPersonForMonths>>;
  caption: string;
}) {
  if (data.people.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        Nenhuma entrada lançada no período.
      </p>
    );
  }

  // Só as categorias que tiveram valor no período, para a tabela caber no celular.
  const categories = data.categories.filter((c) =>
    data.people.some((p) => p.byCategory[c.id] > 0)
  );

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="mb-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="py-2 pr-4 font-medium">Pessoa</th>
            {categories.map((c) => (
              <th key={c.id} className="py-2 pr-4 text-right font-medium">
                {c.name}
              </th>
            ))}
            <th className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.people.map((p) => (
            <tr key={p.person} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-4 text-slate-800">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: PERSON_COLORS[p.person] }}
                  />
                  {PERSON_LABELS[p.person]}
                </span>
              </td>
              {categories.map((c) => (
                <td key={c.id} className="py-2 pr-4 text-right text-slate-600">
                  {p.byCategory[c.id] > 0 ? formatCurrency(p.byCategory[c.id]) : "—"}
                </td>
              ))}
              <td className="py-2 text-right font-medium text-slate-900">
                {formatCurrency(p.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
