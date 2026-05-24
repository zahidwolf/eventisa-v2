"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { adminRoutes } from "@/config/admin-routes";
import {
  approveEvent,
  rejectEvent,
  unpublishEvent,
  deleteEvent,
} from "@/services/admin/admin-events.service";

interface AdminEventActionsProps {
  eventId: string;
  slug: string;
  status?: string;
  approvalStatus?: string;
  onChanged?: () => void;
}

export function AdminEventActions({
  eventId,
  slug,
  status,
  approvalStatus,
  onChanged,
}: AdminEventActionsProps) {
  const isPending =
    approvalStatus === "pending" || status === "pending";

  const mutateOpts = {
    onSuccess: () => {
      toast.success("Updated");
      onChanged?.();
    },
    onError: () => toast.error("Action failed"),
  };

  const approveMut = useMutation({ mutationFn: () => approveEvent(eventId), ...mutateOpts });
  const rejectMut = useMutation({
    mutationFn: () => rejectEvent(eventId, "Rejected by admin"),
    ...mutateOpts,
  });
  const unpublishMut = useMutation({ mutationFn: () => unpublishEvent(eventId), ...mutateOpts });
  const deleteMut = useMutation({
    mutationFn: () => deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted");
      onChanged?.();
    },
    onError: () => toast.error("Delete failed"),
  });

  const handleDelete = () => {
    if (window.confirm("Delete this event permanently?")) deleteMut.mutate();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" asChild>
        <Link href={routes.event(slug)} target="_blank">
          View public
        </Link>
      </Button>
      <Button size="sm" variant="secondary" asChild>
        <Link href={adminRoutes.eventOverview(eventId)}>Manage</Link>
      </Button>
      <Button size="sm" className="bg-accent-magenta hover:bg-accent-magenta/90" asChild>
        <Link href={adminRoutes.editEvent(eventId)}>Edit</Link>
      </Button>
      {isPending && (
        <>
          <Button size="sm" onClick={() => approveMut.mutate()} disabled={approveMut.isPending}>
            Approve
          </Button>
          <Button size="sm" variant="secondary" onClick={() => rejectMut.mutate()}>
            Reject
          </Button>
        </>
      )}
      {status === "live" && (
        <Button size="sm" variant="secondary" onClick={() => unpublishMut.mutate()}>
          Unpublish
        </Button>
      )}
      <Button size="sm" variant="secondary" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
