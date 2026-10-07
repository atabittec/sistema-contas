"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, monthTickLabel } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";

type Point = { month: string; total: number };

export function CategoryHistoryChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({ ...d, label: monthTickLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData}>
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
        <Line
          type="monotone"
          dataKey="total"
          stroke={CHART_COLORS.neutral}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS.neutral, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
