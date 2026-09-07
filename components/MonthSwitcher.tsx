import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <Link
        href={`${basePath}?month=${prev}`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-brand"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={16} />
      </Link>
      <span className="min-w-36 text-center text-sm font-medium capitalize text-slate-800">
        {label}
      </span>
      <Link
        href={`${basePath}?month=${next}`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-brand"
        aria-label="Próximo mês"
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
