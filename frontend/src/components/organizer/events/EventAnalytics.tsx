"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
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
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminEventAnalytics } from "@/services/admin/admin-event-detail.service";
import { fetchEventAnalytics } from "@/services/organizer/organizer-events.service";

const SEGMENT_COLORS = ["#FF3EA5", "#9B5CFF", "#3B82F6", "#10B981", "#F59E0B"];

function formatBdt(n: number) {
  return `৳${n.toLocaleString("en-BD")}`;
}

const tooltipStyle = { background: "#12121a", border: "1px solid #333", borderRadius: 8 };

interface EventAnalyticsProps {
  eventId: string;
  apiScope?: "organizer" | "admin";
  /** When false, skips the fetch (e.g. analytics tab not active). */
  enabled?: boolean;
}

export function EventAnalytics({ eventId, apiScope = "organizer", enabled = true }: EventAnalyticsProps) {
  const pathname = usePathname();
  const analyticsActive =
    enabled && (apiScope === "admin" || pathname.includes("/analytics"));

  const { data, isLoading } = useQuery({
    queryKey: ["event-analytics", eventId, apiScope],
    queryFn: () =>
      apiScope === "admin" ? fetchAdminEventAnalytics(eventId) : fetchEventAnalytics(eventId),
    enabled: analyticsActive,
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const { summary, salesByDay, segmentBreakdown, checkInRate } = data;
  const checkInData = [
    { name: "Checked in", value: checkInRate.checkedIn },
    { name: "Not checked in", value: Math.max(0, checkInRate.totalSold - checkInRate.checkedIn) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total revenue", formatBdt(summary.totalRevenue)],
          ["Avg ticket price", formatBdt(summary.avgTicketPrice)],
          ["Best segment", summary.bestSegment],
          ["Check-in rate", `${summary.checkInRate}%`],
        ].map(([label, val]) => (
          <div key={label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-2 font-display text-xl font-bold text-white">{val}</p>
          </div>
        ))}
      </div>

      <ChartPanel title="Sales over time">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={salesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis tick={{ fill: "#888" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#9B5CFF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Revenue over time">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={salesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis tick={{ fill: "#888" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatBdt(Number(v))} />
            <Line type="monotone" dataKey="revenue" stroke="#FF3EA5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Tickets by segment">
          {segmentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={segmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 10 }} />
                <YAxis tick={{ fill: "#888" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sold" radius={[6, 6, 0, 0]}>
                  {segmentBreakdown.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-zinc-500">No sales data yet.</p>
          )}
        </ChartPanel>

        <ChartPanel title="Revenue by segment">
          {segmentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={segmentBreakdown}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name }) => name}
                >
                  {segmentBreakdown.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatBdt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-zinc-500">No revenue data yet.</p>
          )}
        </ChartPanel>
      </div>

      <ChartPanel title={`Check-in rate — ${checkInRate.percentage}%`}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={checkInData} layout="vertical">
            <XAxis type="number" tick={{ fill: "#888" }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 12 }} width={120} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#EC4899" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
