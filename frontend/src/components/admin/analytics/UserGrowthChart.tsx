"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsChartShell } from "@/components/admin/analytics/AnalyticsChartShell";
import { formatChartDate } from "@/lib/formatCurrency";
import type { UsersTimeSeriesPoint } from "@/types/adminAnalytics.types";

const tooltipStyle = { background: "#151B31", border: "1px solid #334155" };

export function UserGrowthChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data?: UsersTimeSeriesPoint[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const chartData = data?.map((d) => ({ ...d, label: formatChartDate(d.date) })) ?? [];

  return (
    <AnalyticsChartShell title="New user signups" loading={loading} error={error} onRetry={onRetry}>
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </AnalyticsChartShell>
  );
}
