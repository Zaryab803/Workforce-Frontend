"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { Dashboard } from "@/types";
import { label } from "@/lib/utils";
const tooltip = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--text)",
  fontSize: 12,
};
export function TrendChart({ data }: { data: Dashboard["trend"] }) {
  return (
    <div
      className="chart"
      role="img"
      aria-label="Tasks completed each day over the last seven days"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 12, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="violet-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Tooltip contentStyle={tooltip} />
          <Area
            type="monotone"
            name="Completed"
            dataKey="completed"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#violet-fill)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function PriorityChart({ data }: { data: Dashboard["priority"] }) {
  return (
    <div className="chart" role="img" aria-label="Task counts by priority">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.map((d) => ({ ...d, name: label(d.name) }))}
          margin={{ left: -25, right: 10, top: 10 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Tooltip contentStyle={tooltip} />
          <Bar
            dataKey="value"
            name="Tasks"
            radius={[6, 6, 0, 0]}
            maxBarSize={55}
          >
            {data.map((d, i) => (
              <Cell
                key={d.name}
                fill={["#82bba8", "#a6a0eb", "#efbb71", "#e98898"][i]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
