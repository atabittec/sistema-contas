"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";

type Point = { month: string; income: number; expense: number };

function monthTickLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "");
}

export function IncomeExpenseChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({ ...d, label: monthTickLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barGap={2} barCategoryGap="20%">
        <CartesianGrid
          vertical={false}
          stroke={CHART_COLORS.gridline}
          strokeWidth={1}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_COLORS.mutedInk, fontSize: 12 }}
          axisLine={{ stroke: CHART_COLORS.gridline }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.mutedInk, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v).replace(",00", "")}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            borderRadius: 8,
            borderColor: CHART_COLORS.gridline,
            fontSize: 13,
          }}
        />
        <Legend
          formatter={(value) =>
            value === "income" ? "Entradas" : "Saídas"
          }
          wrapperStyle={{ fontSize: 13, color: CHART_COLORS.secondaryInk }}
        />
        <Bar
          dataKey="income"
          name="income"
          fill={CHART_COLORS.income}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="expense"
          name="expense"
          fill={CHART_COLORS.expense}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
