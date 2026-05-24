"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckInDashboard } from "@/components/organizer/checkin/CheckInDashboard";
import { fetchAdminEventHeader } from "@/services/admin/admin-event-detail.service";

export default function AdminEventCheckinPage() {
  const eventId = useParams().id as string;
  const { data: event } = useQuery({
    queryKey: ["admin-event-header", eventId],
    queryFn: () => fetchAdminEventHeader(eventId),
  });

  return (
    <CheckInDashboard eventId={eventId} eventTitle={event?.title} apiScope="admin" />
  );
}
