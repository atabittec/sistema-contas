"use client";

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

type Slice = { categoryName: string; total: number };

export function CategoryBarChart({ data }: { data: Slice[] }) {
  const height = Math.max(180, data.length * 36 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 24 }}
      >
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
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
