"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/container";
import { EventManageHeader } from "@/components/organizer/events/EventManageHeader";
import { EventManageNav } from "@/components/organizer/events/EventManageNav";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchOrganizerEvent } from "@/services/organizer/organizer-events.service";

export default function EventManageLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const eventId = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizer-event", eventId],
    queryFn: () => fetchOrganizerEvent(eventId),
  });

  const event = data?.data.event;

  if (isLoading) {
    return (
      <Container className="py-8">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="mt-8 h-10 w-full" />
        <Skeleton className="mt-8 h-64 w-full" />
      </Container>
    );
  }

  if (isError || !event) {
    return (
      <Container className="py-16 text-center text-zinc-500">
        Event not found or you do not have access.
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <EventManageHeader
        event={{
          _id: event._id,
          title: event.title,
          status: event.status ?? "draft",
          approvalStatus: event.approvalStatus ?? "pending",
          startDate: event.startDate,
          venue: event.venue,
        }}
      />
      <div className="mt-6">
        <EventManageNav eventId={eventId} />
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}
