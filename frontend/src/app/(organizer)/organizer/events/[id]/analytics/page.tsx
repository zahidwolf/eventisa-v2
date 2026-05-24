"use client";

import { useParams } from "next/navigation";
import { EventAnalytics } from "@/components/organizer/events/EventAnalytics";

export default function EventAnalyticsPage() {
  const eventId = useParams().id as string;
  return <EventAnalytics eventId={eventId} />;
}
