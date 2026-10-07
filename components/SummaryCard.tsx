import { formatCurrency } from "@/lib/format";

export function SummaryCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "pending";
  icon: React.ComponentType<{ size?: number }>;
}) {
  const styles = {
    income: { icon: "bg-emerald-50 text-emerald-600", text: "text-emerald-700" },
    expense: { icon: "bg-rose-50 text-rose-600", text: "text-rose-700" },
    pending: { icon: "bg-amber-50 text-amber-600", text: "text-amber-700" },
  }[tone];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
      >
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p
          className={`mt-0.5 whitespace-nowrap text-2xl font-semibold lg:text-xl ${styles.text}`}
        >
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}
