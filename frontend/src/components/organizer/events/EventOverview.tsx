"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ScanLine, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { fetchEventOverview } from "@/services/organizer/organizer-events.service";
import { cn } from "@/lib/utils";

function formatBdt(n: number) {
  return `৳${n.toLocaleString("en-BD")}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EventOverviewProps {
  eventId: string;
}

export function EventOverview({ eventId }: EventOverviewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["event-overview", eventId],
    queryFn: () => fetchEventOverview(eventId),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const { stats, segments, recentAttendees, recentCheckIns } = data;
  const sold = stats.totalSold ?? stats.ticketsSold ?? 0;
  const capacity = stats.capacity ?? stats.totalCapacity ?? 0;
  const checkedIn = stats.checkedIn ?? stats.checkedInCount ?? 0;
  const checkInRate =
    stats.checkInRate ?? (sold ? Math.round((checkedIn / sold) * 100) : 0);

  const statCards = [
    { label: "Tickets sold", value: `${sold} / ${capacity}` },
    { label: "Revenue", value: formatBdt(stats.revenue) },
    { label: "Checked in", value: `${checkedIn} (${checkInRate}%)` },
    { label: "Active promo codes", value: String(stats.activePromoCodes) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{c.label}</p>
            <p className="mt-2 font-display text-xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {(stats.platformFee != null || stats.netRevenue != null) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.platformFee != null && (
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs text-zinc-500">Platform fee</p>
              <p className="mt-2 font-display text-lg font-bold text-white">
                {formatBdt(stats.platformFee)}
              </p>
            </div>
          )}
          {stats.netRevenue != null && (
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs text-zinc-500">Net revenue</p>
              <p className="mt-2 font-display text-lg font-bold text-white">
                {formatBdt(stats.netRevenue)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="glass-panel overflow-hidden rounded-2xl">
        <h2 className="border-b border-white/[0.08] px-4 py-3 font-semibold text-white">
          Segment breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500">
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Sold</th>
                <th className="px-4 py-3 font-medium">Remaining</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg) => {
                const soldOut =
                  seg.isSoldOut ?? (seg.capacity > 0 && seg.remaining <= 0);
                return (
                  <tr
                    key={seg.segmentId}
                    className={cn(
                      "border-b border-white/[0.04]",
                      soldOut && "bg-[#FF3EA5]/5"
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-white">{seg.name}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {seg.isFree ? "Free" : formatBdt(seg.price)}
                    </td>
                    <td className="px-4 py-3">{seg.sold}</td>
                    <td className="px-4 py-3">{seg.remaining}</td>
                    <td className="px-4 py-3">{formatBdt(seg.revenue)}</td>
                    <td className="px-4 py-3">
                      {soldOut ? (
                        <span className="rounded-full bg-[#FF3EA5]/20 px-2 py-0.5 text-xs text-[#FF3EA5]">
                          Sold out
                        </span>
                      ) : (
                        <span className="capitalize text-zinc-500">{seg.status}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent attendees</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.organizer.eventAttendees(eventId)}>
                <Users className="mr-1.5 h-4 w-4" />
                View all
              </Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {recentAttendees.length === 0 && (
              <li className="text-sm text-zinc-500">No registrations yet.</li>
            )}
            {recentAttendees.map((a, i) => (
              <li key={`${a.name}-${a.createdAt}-${i}`} className="flex justify-between gap-2 text-sm">
                <span className="font-medium text-white">{a.name || "Guest"}</span>
                <span className="text-zinc-500">
                  {a.segmentName} · {formatTime(a.createdAt ?? a.purchasedAt ?? "")}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent check-ins</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.organizer.eventCheckin(eventId)}>
                <ScanLine className="mr-1.5 h-4 w-4" />
                Open scanner
              </Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {recentCheckIns.length === 0 && (
              <li className="text-sm text-zinc-500">No check-ins yet.</li>
            )}
            {recentCheckIns.map((c, i) => (
              <li
                key={`${c.attendeeName}-${c.scannedAt}-${i}`}
                className="flex justify-between gap-2 text-sm"
              >
                <span className="font-medium text-white">{c.attendeeName}</span>
                <span className="text-zinc-500">
                  {c.segmentName} · {formatTime(c.scannedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
