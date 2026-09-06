import Link from "next/link";
import { formatCompetenceMonth, shiftCompetenceMonth } from "@/lib/format";

export function MonthSwitcher({
  month,
  basePath,
}: {
  month: string;
  basePath: string;
}) {
  const prev = shiftCompetenceMonth(month, -1);
  const next = shiftCompetenceMonth(month, 1);
  const label = formatCompetenceMonth(month);

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`${basePath}?month=${prev}`}
        className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100"
        aria-label="Mês anterior"
      >
        &larr;
      </Link>
      <span className="min-w-36 text-center text-sm font-medium capitalize text-slate-800">
        {label}
      </span>
      <Link
        href={`${basePath}?month=${next}`}
        className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100"
        aria-label="Próximo mês"
      >
        &rarr;
      </Link>
    </div>
  );
}
