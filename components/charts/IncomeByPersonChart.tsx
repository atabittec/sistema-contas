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
import { formatCurrency, PERSON_LABELS } from "@/lib/format";
import { CHART_COLORS, PERSON_COLORS } from "@/lib/chart-colors";

type PersonKey = keyof typeof PERSON_COLORS;
type Point = { month: string } & Record<PersonKey, number>;

const PEOPLE: PersonKey[] = ["ANDRE", "USUARIA", "CASAL"];

function monthTickLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "");
}

export function IncomeByPersonChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({ ...d, label: monthTickLabel(d.month) }));
  // Só quem teve alguma entrada no período aparece (cor continua a da pessoa).
  const people = PEOPLE.filter((p) => data.some((d) => d[p] > 0));

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
          formatter={(value, name) => [
            formatCurrency(Number(value)),
            PERSON_LABELS[String(name)],
          ]}
          cursor={{ fill: CHART_COLORS.gridline, fillOpacity: 0.4 }}
          itemStyle={{ color: CHART_COLORS.ink }}
          contentStyle={{
            borderRadius: 8,
            borderColor: CHART_COLORS.gridline,
            fontSize: 13,
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: CHART_COLORS.secondaryInk }}>
              {PERSON_LABELS[String(value)]}
            </span>
          )}
          wrapperStyle={{ fontSize: 13, color: CHART_COLORS.secondaryInk }}
        />
        {people.map((p) => (
          <Bar
            key={p}
            dataKey={p}
            name={p}
            fill={PERSON_COLORS[p]}
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
