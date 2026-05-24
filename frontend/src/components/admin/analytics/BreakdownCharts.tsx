"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsChartShell } from "@/components/admin/analytics/AnalyticsChartShell";
import { formatBDT } from "@/lib/formatCurrency";
import type { CategoryBreakdown, CityBreakdown } from "@/types/adminAnalytics.types";

const PIE_COLORS = ["#FF3EA5", "#9B5CFF", "#4F8CFF", "#10B981", "#F59E0B", "#EC4899", "#6366f1"];
const tooltipStyle = { background: "#151B31", border: "1px solid #334155" };

export function BreakdownCharts({
  categories,
  cities,
  loading,
  error,
  onRetry,
}: {
  categories?: CategoryBreakdown[];
  cities?: CityBreakdown[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const pieData =
    categories?.map((c) => ({ name: c.category, value: c.revenue, percentage: c.percentage })) ?? [];
  const cityData = cities?.map((c) => ({ ...c, name: c.city })) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AnalyticsChartShell
        title="Revenue by category"
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {!loading && !error && pieData.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">No category data yet</p>
        ) : (
          !loading &&
          !error && (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => formatBDT(Number(v))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )
        )}
      </AnalyticsChartShell>
      <AnalyticsChartShell title="Revenue by city (top 10)" loading={loading} error={error} onRetry={onRetry}>
        {!loading && !error && cityData.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">No city data yet</p>
        ) : (
          !loading &&
          !error && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cityData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatBDT(Number(v))} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </AnalyticsChartShell>
    </div>
  );
}
