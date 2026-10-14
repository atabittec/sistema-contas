"use client";

import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
} from "recharts";
import { formatCurrency, monthTickLabel } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";

type Point = { month: string; total: number };

export function CategoryHistoryChart({
  data,
  year,
  categoryId,
  selectedMonth,
}: {
  data: Point[];
  year: number;
  categoryId: string;
  selectedMonth?: string;
}) {
  const router = useRouter();
  const chartData = data.map((d) => ({ ...d, label: monthTickLabel(d.month) }));

  function handleClick(state: MouseHandlerDataParam) {
    // activeIndex vem como string (ex: "9"), não número.
    const index =
      state.activeIndex != null ? Number(state.activeIndex) : NaN;
    const month = !Number.isNaN(index) ? chartData[index]?.month : undefined;
    if (!month) return;
    router.push(
      `/relatorios?year=${year}&categoryId=${categoryId}&historyMonth=${month}`,
      { scroll: false }
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} onClick={handleClick} className="cursor-pointer">
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
            dot={(props) => (
              <Dot
                key={props.payload.month}
                cx={props.cx}
                cy={props.cy}
                active={props.payload.month === selectedMonth}
              />
            )}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-slate-400">
        Clique em um ponto do gráfico pra ver os lançamentos daquele mês.
      </p>
    </div>
  );
}

function Dot({ cx, cy, active }: { cx?: number; cy?: number; active: boolean }) {
  if (cx === undefined || cy === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={active ? 6 : 4}
      fill={active ? CHART_COLORS.ink : CHART_COLORS.neutral}
      stroke={active ? CHART_COLORS.neutral : "none"}
      strokeWidth={active ? 2 : 0}
    />
  );
}
