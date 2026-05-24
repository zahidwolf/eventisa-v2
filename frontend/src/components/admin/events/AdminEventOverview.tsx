"use client";

import { useQuery } from "@tanstack/react-query";
import { CoverImage } from "@/components/media/cover-image";
import { Skeleton } from "@/components/ui/skeleton";
import { EventPaymentGateway } from "@/components/admin/events/EventPaymentGateway";
import { fetchAdminEventOverview } from "@/services/admin/admin-event-detail.service";

function formatBdt(n: number) {
  return `৳${n.toLocaleString("en-BD")}`;
}

export function AdminEventOverview({ eventId }: { eventId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-event-overview", eventId],
    queryFn: () => fetchAdminEventOverview(eventId),
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const ev = data.event as {
    title: string;
    description?: string;
    shortDescription?: string;
    category?: string;
    coverImage?: string;
    startDate: string;
    endDate: string;
    venue: { name: string; address?: string; city: string };
    city?: string;
    approvalStatus?: string;
    status?: string;
    createdAt?: string;
    organizer?: { name: string; email?: string };
  };

  const stats = [
    ["Bookings", `${data.stats.totalBookings} / ${data.stats.totalCapacity}`],
    ["Gross revenue", formatBdt(data.stats.grossRevenue)],
    ["Platform fee", formatBdt(data.stats.platformFee)],
    ["Net organizer", formatBdt(data.stats.netOrganizer)],
    ["Check-in rate", `${data.stats.checkInRate}%`],
    ["Active promos", String(data.stats.activePromoCodes)],
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, val]) => (
          <div key={label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-2 font-display text-xl font-bold text-white">{val}</p>
          </div>
        ))}
      </div>

      <EventPaymentGateway eventId={eventId} />

      <div className="glass-panel grid gap-6 rounded-2xl p-6 md:grid-cols-[240px_1fr]">
        {ev.coverImage && (
          <div className="relative aspect-video overflow-hidden rounded-xl md:aspect-[4/3]">
            <CoverImage src={ev.coverImage} alt="" fill />
          </div>
        )}
        <div className="space-y-3 text-sm">
          <h2 className="text-lg font-semibold text-white">{ev.title}</h2>
          <p className="text-zinc-400">{ev.shortDescription ?? ev.description?.slice(0, 200)}</p>
          <p>
            <span className="text-zinc-500">Category: </span>
            {ev.category}
          </p>
          <p>
            <span className="text-zinc-500">When: </span>
            {new Date(ev.startDate).toLocaleString()} – {new Date(ev.endDate).toLocaleString()}
          </p>
          <p>
            <span className="text-zinc-500">Venue: </span>
            {ev.venue.name}, {ev.venue.city}
          </p>
          <p>
            <span className="text-zinc-500">Organizer: </span>
            {ev.organizer?.name} ({ev.organizer?.email})
          </p>
          <p>
            <span className="text-zinc-500">Approval: </span>
            <span className="capitalize">{ev.approvalStatus}</span> · status {ev.status}
          </p>
          {ev.createdAt && (
            <p>
              <span className="text-zinc-500">Created: </span>
              {new Date(ev.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs text-zinc-500">
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Sold</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Check-in</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.segments.map((s) => (
              <tr key={s.segmentId} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3">{s.isFree ? "Free" : formatBdt(s.price)}</td>
                <td className="px-4 py-3">{s.capacity}</td>
                <td className="px-4 py-3">{s.sold}</td>
                <td className="px-4 py-3">{s.remaining}</td>
                <td className="px-4 py-3">{formatBdt(s.revenue)}</td>
                <td className="px-4 py-3">{s.checkInCount}</td>
                <td className="px-4 py-3 capitalize text-zinc-400">{s.status}</td>
              </tr>
            ))}
            <tr className="bg-white/[0.03] font-medium text-white">
              <td className="px-4 py-3">Totals</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">{data.segmentTotals.capacity}</td>
              <td className="px-4 py-3">{data.segmentTotals.sold}</td>
              <td className="px-4 py-3">{data.segmentTotals.remaining}</td>
              <td className="px-4 py-3">{formatBdt(data.segmentTotals.revenue)}</td>
              <td className="px-4 py-3">{data.segmentTotals.checkInCount}</td>
              <td className="px-4 py-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
