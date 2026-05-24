"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/config/admin-routes";
import { routes } from "@/config/routes";
import {
  approveEvent,
  rejectEvent,
  unpublishEvent,
  deleteEvent,
} from "@/services/admin/admin-events.service";
import type { AdminEventHeader } from "@/services/admin/admin-event-detail.service";
import { RejectModal } from "@/components/admin/events/RejectModal";
import { AdminConfirmDialog } from "@/components/admin/events/AdminConfirmDialog";
import { OrganizerDetailDrawer } from "@/components/admin/events/OrganizerDetailDrawer";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    live: "bg-emerald-500/20 text-emerald-300",
    pending: "bg-amber-500/20 text-amber-300",
    draft: "bg-zinc-500/20 text-zinc-300",
    rejected: "bg-red-500/20 text-red-300",
  };
  return map[status] ?? "bg-zinc-500/20 text-zinc-300";
}

interface AdminEventManageHeaderProps {
  event: AdminEventHeader;
}

export function AdminEventManageHeader({ event }: AdminEventManageHeaderProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);
  const isPending = event.approvalStatus === "pending" || event.status === "pending";

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-event-header", event._id] });
    qc.invalidateQueries({ queryKey: ["admin-event-overview", event._id] });
  };

  const approveMut = useMutation({
    mutationFn: () => approveEvent(event._id),
    onSuccess: () => {
      toast.success("Event approved");
      invalidate();
    },
    onError: () => toast.error("Approve failed"),
  });

  const rejectMut = useMutation({
    mutationFn: (reason: string) => rejectEvent(event._id, reason),
    onSuccess: () => {
      toast.success("Event rejected");
      setRejectOpen(false);
      invalidate();
    },
    onError: () => toast.error("Reject failed"),
  });

  const unpublishMut = useMutation({
    mutationFn: () => unpublishEvent(event._id),
    onSuccess: () => {
      toast.success("Event unpublished");
      invalidate();
    },
    onError: () => toast.error("Unpublish failed"),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteEvent(event._id),
    onSuccess: () => {
      toast.success("Event deleted");
      router.push(adminRoutes.events);
    },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div className="border-b border-white/[0.08] pb-6">
      <Link
        href={adminRoutes.events}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All events
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-bold text-white md:text-2xl">{event.title}</h1>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs capitalize", statusBadge(event.status))}>
              {event.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {formatDate(event.startDate)} · {event.venue.name}, {event.venue.city}
          </p>
          {event.organizer?.id && (
            <button
              type="button"
              onClick={() => setOrganizerOpen(true)}
              className="mt-1 text-sm text-accent-magenta hover:underline"
            >
              {event.organizer.name}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-accent-magenta hover:bg-accent-magenta/90" asChild>
            <Link href={adminRoutes.editEvent(event._id)}>Edit event</Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href={routes.event(event.slug)} target="_blank">
              View public
            </Link>
          </Button>
          {isPending && (
            <>
              <Button size="sm" onClick={() => approveMut.mutate()} disabled={approveMut.isPending}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
            </>
          )}
          {event.status === "live" && (
            <Button size="sm" variant="secondary" onClick={() => unpublishMut.mutate()}>
              Unpublish
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        loading={rejectMut.isPending}
        onConfirm={(reason) => rejectMut.mutate(reason)}
      />
      <AdminConfirmDialog
        open={deleteOpen}
        title="Delete event"
        description="This permanently removes the event. Unpublish live events first if needed."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate()}
      />
      {event.organizer?.id && (
        <OrganizerDetailDrawer
          organizerId={event.organizer.id}
          open={organizerOpen}
          onOpenChange={setOrganizerOpen}
        />
      )}
    </div>
  );
}
