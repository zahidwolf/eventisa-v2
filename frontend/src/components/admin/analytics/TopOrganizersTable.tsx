"use client";

import Link from "next/link";
import { formatBDT, formatNumber } from "@/lib/formatCurrency";
import { adminRoutes } from "@/config/admin-routes";
import type { TopOrganizer } from "@/types/adminAnalytics.types";

export function TopOrganizersTable({
  data,
  loading,
}: {
  data?: TopOrganizer[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
      <h3 className="font-semibold text-white">Top organizers by revenue</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-zinc-500">
              <th className="pb-3 pr-2">#</th>
              <th className="pb-3 pr-2">Organizer</th>
              <th className="pb-3 pr-2 hidden sm:table-cell">Organization</th>
              <th className="pb-3 pr-2 text-right">Events</th>
              <th className="pb-3 pr-2 text-right">Tickets</th>
              <th className="pb-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row, i) => (
              <tr key={row.organizerId} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 pr-2 text-zinc-500">{i + 1}</td>
                <td className="py-3 pr-2 font-medium text-white">{row.name}</td>
                <td className="py-3 pr-2 hidden sm:table-cell text-zinc-400">{row.organizationName}</td>
                <td className="py-3 pr-2 text-right text-zinc-300">{row.totalEvents}</td>
                <td className="py-3 pr-2 text-right text-zinc-300">
                  {formatNumber(row.totalTicketsSold)}
                </td>
                <td className="py-3 text-right font-medium text-white">{formatBDT(row.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data || data.length === 0) && (
          <p className="py-8 text-center text-sm text-zinc-500">No organizer revenue yet</p>
        )}
      </div>
      <Link href={adminRoutes.organizers} className="mt-4 inline-block text-sm text-[#FF3EA5] hover:underline">
        View all organizers →
      </Link>
    </div>
  );
}
