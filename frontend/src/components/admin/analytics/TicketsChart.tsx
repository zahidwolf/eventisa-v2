"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsChartShell } from "@/components/admin/analytics/AnalyticsChartShell";
import { formatChartDate } from "@/lib/formatCurrency";
import type { TicketsTimeSeriesPoint } from "@/types/adminAnalytics.types";

const tooltipStyle = { background: "#151B31", border: "1px solid #334155" };

export function TicketsChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data?: TicketsTimeSeriesPoint[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const chartData = data?.map((d) => ({ ...d, label: formatChartDate(d.date) })) ?? [];

  return (
    <AnalyticsChartShell title="Tickets sold over time" loading={loading} error={error} onRetry={onRetry}>
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="tickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </AnalyticsChartShell>
  );
}
