"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsChartShell } from "@/components/admin/analytics/AnalyticsChartShell";
import { formatBDT, formatChartDate } from "@/lib/formatCurrency";
import type { RevenueTimeSeriesPoint } from "@/types/adminAnalytics.types";

const tooltipStyle = { background: "#151B31", border: "1px solid #334155" };

export function RevenueChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data?: RevenueTimeSeriesPoint[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const chartData = data?.map((d) => ({ ...d, label: formatChartDate(d.date) })) ?? [];

  return (
    <AnalyticsChartShell title="Revenue over time" loading={loading} error={error} onRetry={onRetry}>
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                if (name === "revenue") return [formatBDT(Number(value)), "Revenue"];
                return [value, "Orders"];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ec4899"
              fill="url(#revenueGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </AnalyticsChartShell>
  );
}
