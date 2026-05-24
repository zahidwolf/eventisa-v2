"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEventManageHeader } from "@/components/admin/events/AdminEventManageHeader";
import { AdminEventNav } from "@/components/admin/events/AdminEventNav";
import { fetchAdminEventHeader } from "@/services/admin/admin-event-detail.service";

export default function AdminEventDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const eventId = params.id as string;

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ["admin-event-header", eventId],
    queryFn: () => fetchAdminEventHeader(eventId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !event) {
    return <p className="text-zinc-500">Event not found.</p>;
  }

  return (
    <div className="space-y-8">
      <AdminEventManageHeader event={event} />
      <AdminEventNav eventId={eventId} />
      <div>{children}</div>
    </div>
  );
}
