"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardData } from "@/services/admin/admin-dashboard.service";

const PIE_COLORS = ["#FF3EA5", "#9B5CFF", "#4F8CFF", "#10B981", "#F59E0B", "#EC4899"];

const tooltipStyle = { background: "#151B31", border: "1px solid #334155" };

export function AdminCharts({ charts }: { charts: AdminDashboardData["charts"] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartPanel title="Revenue over time (30d)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={charts.bookingTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `৳${Number(v).toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#FF3EA5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Tickets sold over time (30d)">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={charts.bookingTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="tickets" stroke="#9B5CFF" fill="#9B5CFF33" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Events by category">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={charts.categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {charts.categories.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="New users (30d)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={charts.userTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} />
            <YAxis tick={{ fill: "#64748b" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#4F8CFF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
