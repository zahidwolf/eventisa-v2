"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventAnalytics } from "@/components/organizer/events/EventAnalytics";
import { fetchAdminEventAnalytics } from "@/services/admin/admin-event-detail.service";
import { Skeleton } from "@/components/ui/skeleton";

function formatBdt(n: number) {
  return `৳${n.toLocaleString("en-BD")}`;
}

export default function AdminEventAnalyticsPage() {
  const eventId = useParams().id as string;

  const { data: feeData, isLoading } = useQuery({
    queryKey: ["admin-event-analytics-fee", eventId],
    queryFn: () => fetchAdminEventAnalytics(eventId),
  });

  return (
    <div className="space-y-8">
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-zinc-500">Platform fee earned (this event)</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {formatBdt(feeData?.platformFeeEarned ?? 0)}
          </p>
        </div>
      )}
      <EventAnalytics eventId={eventId} apiScope="admin" />
    </div>
  );
}
