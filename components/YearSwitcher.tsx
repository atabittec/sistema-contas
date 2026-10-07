import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function YearSwitcher({
  year,
  basePath,
}: {
  year: number;
  basePath: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <Link
        href={`${basePath}?year=${year - 1}`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-brand"
        aria-label="Ano anterior"
      >
        <ChevronLeft size={16} />
      </Link>
      <span className="min-w-16 text-center text-sm font-medium text-slate-800">
        {year}
      </span>
      <Link
        href={`${basePath}?year=${year + 1}`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-brand"
        aria-label="Próximo ano"
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
