"use client";

import { useParams } from "next/navigation";
import { EventOverview } from "@/components/organizer/events/EventOverview";

export default function EventOverviewPage() {
  const eventId = useParams().id as string;
  return <EventOverview eventId={eventId} />;
}
