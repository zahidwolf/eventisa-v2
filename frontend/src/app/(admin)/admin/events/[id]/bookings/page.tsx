"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventBookingTable } from "@/components/admin/events/EventBookingTable";
import { fetchAdminEventOverview } from "@/services/admin/admin-event-detail.service";

export default function AdminEventBookingsPage() {
  const eventId = useParams().id as string;
  const searchParams = useSearchParams();
  const segmentId = searchParams.get("segmentId") ?? undefined;

  const { data } = useQuery({
    queryKey: ["admin-event-overview", eventId],
    queryFn: () => fetchAdminEventOverview(eventId),
  });

  const segments = data?.segments.map((s) => ({ segmentId: s.segmentId, name: s.name })) ?? [];

  return (
    <EventBookingTable eventId={eventId} initialSegmentId={segmentId} segments={segments} />
  );
}
