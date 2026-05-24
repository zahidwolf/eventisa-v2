"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardData } from "@/services/admin/admin-dashboard.service";

export function AdminDashboardCharts({ data }: { data: AdminDashboardData }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-6 lg:col-span-2">
        <h3 className="font-semibold text-white">Daily booking trend (30d)</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts.bookingTrend}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3EA5" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF3EA5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#151B31", border: "1px solid #334155" }} />
              <Area type="monotone" dataKey="revenue" stroke="#FF3EA5" fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
        <h3 className="font-semibold text-white">Events by category</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
              <YAxis tick={{ fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "#151B31", border: "1px solid #334155" }} />
              <Bar dataKey="value" fill="#9B5CFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
        <h3 className="font-semibold text-white">Top cities</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.cities} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: "#64748b" }} />
              <YAxis dataKey="name" type="category" width={72} tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#151B31", border: "1px solid #334155" }} />
              <Bar dataKey="value" fill="#4F8CFF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
