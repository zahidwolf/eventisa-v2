"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/organizer/events/event-status-badge";
import { routes } from "@/config/routes";
import {
  publishOrganizerEvent,
  unpublishOrganizerEvent,
} from "@/services/organizer/organizer-events.service";
import { getApiErrorMessage } from "@/services/api/client";

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface EventManageHeaderEvent {
  _id: string;
  title: string;
  status: string;
  approvalStatus: string;
  startDate: string;
  venue: { name: string; city: string };
}

interface EventManageHeaderProps {
  event: EventManageHeaderEvent;
}

export function EventManageHeader({ event }: EventManageHeaderProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const isLive = event.status === "live";
  const canPublish = event.approvalStatus === "approved" && !isLive;

  const toggleMutation = useMutation({
    mutationFn: () => (isLive ? unpublishOrganizerEvent(event._id) : publishOrganizerEvent(event._id)),
    onSuccess: () => {
      toast.success(isLive ? "Event unpublished" : "Event published");
      qc.invalidateQueries({ queryKey: ["organizer-event", event._id] });
      qc.invalidateQueries({ queryKey: ["event-overview", event._id] });
      qc.invalidateQueries({ queryKey: ["organizer-events"] });
      router.refresh();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="border-b border-white/[0.08] pb-6">
      <Link
        href={routes.organizer.events}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All events
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-bold text-white md:text-2xl">{event.title}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {formatEventDate(event.startDate)} · {event.venue.name}, {event.venue.city}
          </p>
        </div>
        {(canPublish || isLive) && (
          <Button
            variant={isLive ? "secondary" : "default"}
            disabled={toggleMutation.isPending || (!isLive && !canPublish)}
            onClick={() => toggleMutation.mutate()}
          >
            {toggleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLive ? "Unpublish" : "Publish"}
          </Button>
        )}
      </div>
    </div>
  );
}
