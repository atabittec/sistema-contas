"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";

type Slice = { categoryId?: string; categoryName: string; total: number };

export function CategoryBarChart({
  data,
  year,
}: {
  data: Slice[];
  /** Quando informado, clicar numa barra navega pra ver os lançamentos daquela categoria no ano. */
  year?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const height = Math.max(180, data.length * 36 + 40);
  const clickable = Boolean(year);

  function handleClick(entry: Slice) {
    if (!year || !entry.categoryId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(year));
    params.set("barCategoryId", entry.categoryId);
    router.push(`/relatorios?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid
            horizontal={false}
            stroke={CHART_COLORS.gridline}
            strokeWidth={1}
          />
          <XAxis
            type="number"
            tick={{ fill: CHART_COLORS.mutedInk, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v).replace(",00", "")}
          />
          <YAxis
            type="category"
            dataKey="categoryName"
            tick={{ fill: CHART_COLORS.secondaryInk, fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: 8,
              borderColor: CHART_COLORS.gridline,
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="total"
            fill={CHART_COLORS.neutral}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            onClick={clickable ? (entry) => handleClick(entry.payload) : undefined}
            cursor={clickable ? "pointer" : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
      {clickable && (
        <p className="mt-1 text-center text-xs text-slate-400">
          Clique numa barra pra ver os lançamentos daquela categoria no ano.
        </p>
      )}
    </div>
  );
}
