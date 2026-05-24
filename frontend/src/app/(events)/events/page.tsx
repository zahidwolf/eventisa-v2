import { Suspense } from "react";
import { EventsPageClient } from "@/app/(events)/events/events-page-client";
import EventsLoading from "@/app/(events)/events/loading";
import { fetchEvents } from "@/services/events/events.service";
import type { EventListItem } from "@/types/models/event";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let initialEvents: EventListItem[] = [];
  try {
    const res = await fetchEvents({ limit: 50 });
    initialEvents = (res.data?.events ?? []) as EventListItem[];
  } catch {
    initialEvents = [];
  }

  return (
    <Suspense fallback={<EventsLoading />}>
      <EventsPageClient initialEvents={initialEvents} />
    </Suspense>
  );
}
