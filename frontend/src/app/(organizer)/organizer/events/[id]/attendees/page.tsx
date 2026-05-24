"use client";

import { useParams } from "next/navigation";
import { AttendeeDashboard } from "@/components/organizer/attendees";

export default function EventAttendeesPage() {
  const eventId = useParams().id as string;
  return <AttendeeDashboard eventId={eventId} />;
}
