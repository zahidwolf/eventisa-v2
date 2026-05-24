"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AnalyticsChartShell } from "@/components/admin/analytics/AnalyticsChartShell";
import type { StatusBreakdown } from "@/types/adminAnalytics.types";

const STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  pending: "#eab308",
  failed: "#ef4444",
  refunded: "#3b82f6",
  cancelled: "#6b7280",
};

const tooltipStyle = { background: "#151B31", border: "1px solid #334155" };

export function OrderStatusChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data?: StatusBreakdown[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const total = data?.reduce((s, d) => s + d.count, 0) ?? 0;
  const chartData =
    data?.map((d) => ({
      name: d.status,
      value: d.count,
      percentage: d.percentage,
    })) ?? [];

  return (
    <AnalyticsChartShell title="Order status" loading={loading} error={error} onRetry={onRetry}>
      {!loading && !error && chartData.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">No orders yet</p>
      ) : (
        !loading &&
        !error && (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#64748b"} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-sm font-semibold"
              >
                {total}
              </text>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                formatter={(value, entry) => {
                  const pct = (entry.payload as { percentage?: number })?.percentage;
                  const count = (entry.payload as { value?: number })?.value;
                  return `${value} (${count}, ${pct ?? 0}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
      )}
    </AnalyticsChartShell>
  );
}
