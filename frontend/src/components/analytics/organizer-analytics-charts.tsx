"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    summary?: {
      ticketsSold?: number;
      revenue?: number;
      attendance?: number;
      conversionRate?: number;
    };
    popularSections?: { title: string; sold: number; revenue: number }[];
    checkIn?: { checkedIn: number; unused: number };
  };
}

export function OrganizerAnalyticsCharts({ data }: Props) {
  const sections = data.popularSections ?? [];
  const checkIn = data.checkIn;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Tickets sold", data.summary?.ticketsSold ?? 0],
          ["Revenue (৳)", data.summary?.revenue ?? 0],
          ["Checked in", data.summary?.attendance ?? 0],
          ["Conversion", `${Math.round((data.summary?.conversionRate ?? 0) * 100)}%`],
        ].map(([label, val]) => (
          <div key={label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-semibold">Popular ticket sections</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="title" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888" }} />
                <Tooltip contentStyle={{ background: "#12121a", border: "1px solid #333" }} />
                <Bar dataKey="sold" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {checkIn && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-semibold">Check-in</h3>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Checked in", value: checkIn.checkedIn },
                  { name: "Unused", value: checkIn.unused },
                ]}
              >
                <XAxis dataKey="name" tick={{ fill: "#888" }} />
                <YAxis tick={{ fill: "#888" }} />
                <Bar dataKey="value" fill="#EC4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
