"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckInDashboard } from "@/components/organizer/checkin/CheckInDashboard";
import { fetchOrganizerEvent } from "@/services/organizer/organizer-events.service";

export default function EventCheckInPage() {
  const eventId = useParams().id as string;
  const { data } = useQuery({
    queryKey: ["organizer-event", eventId],
    queryFn: () => fetchOrganizerEvent(eventId),
  });
  const title = data?.data.event?.title;
  return <CheckInDashboard eventId={eventId} eventTitle={title} />;
}
