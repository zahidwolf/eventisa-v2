"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/config/admin-routes";
import {
  approveEvent,
  rejectEvent,
} from "@/services/admin/admin-events.service";
import {
  approveOrganizerAdmin,
  rejectOrganizerAdmin,
} from "@/services/admin/admin-platform.service";
import type {
  AdminDashboardData,
  AdminPendingEvent,
  AdminPendingOrganizer,
} from "@/services/admin/admin-dashboard.service";

export function AdminPendingQueue({ widgets }: { widgets: AdminDashboardData["widgets"] }) {
  const qc = useQueryClient();
  const events = widgets.pendingEvents ?? [];
  const organizers = widgets.pendingOrganizers ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    qc.invalidateQueries({ queryKey: ["admin-nav-counts"] });
    qc.invalidateQueries({ queryKey: ["admin-events-pending"] });
  };

  const approveEventMut = useMutation({
    mutationFn: (id: string) => approveEvent(id),
    onSuccess: () => {
      toast.success("Event approved");
      invalidate();
    },
    onError: () => toast.error("Failed to approve event"),
  });

  const rejectEventMut = useMutation({
    mutationFn: (id: string) => rejectEvent(id, "Not approved"),
    onSuccess: () => {
      toast.success("Event rejected");
      invalidate();
    },
    onError: () => toast.error("Failed to reject event"),
  });

  const approveOrgMut = useMutation({
    mutationFn: (id: string) => approveOrganizerAdmin(id),
    onSuccess: () => {
      toast.success("Organizer approved");
      invalidate();
    },
    onError: () => toast.error("Failed to approve organizer"),
  });

  const rejectOrgMut = useMutation({
    mutationFn: (id: string) => rejectOrganizerAdmin(id),
    onSuccess: () => {
      toast.success("Organizer rejected");
      invalidate();
    },
    onError: () => toast.error("Failed to reject organizer"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <QueueSection title="Events pending approval" href={adminRoutes.eventsPending}>
        {events.length === 0 && <p className="text-sm text-zinc-600">No pending events</p>}
        {events.map((e) => (
          <PendingEventRow
            key={e._id}
            event={e}
            onApprove={() => approveEventMut.mutate(e._id)}
            onReject={() => rejectEventMut.mutate(e._id)}
            busy={approveEventMut.isPending || rejectEventMut.isPending}
          />
        ))}
      </QueueSection>
      <QueueSection title="Organizers pending" href={adminRoutes.organizersPending}>
        {organizers.length === 0 && <p className="text-sm text-zinc-600">No pending organizers</p>}
        {organizers.map((o) => (
          <div key={o._id} className="flex items-center justify-between gap-2 border-b border-white/[0.04] py-3 text-sm">
            <span className="text-zinc-300">{o.businessName}</span>
            <div className="flex gap-1">
              <Button size="sm" onClick={() => approveOrgMut.mutate(o._id)} disabled={approveOrgMut.isPending}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => rejectOrgMut.mutate(o._id)}>
                Reject
              </Button>
            </div>
          </div>
        ))}
      </QueueSection>
    </div>
  );
}

function QueueSection({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <Button size="sm" variant="ghost" asChild>
          <Link href={href}>View all</Link>
        </Button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function PendingEventRow({
  event,
  onApprove,
  onReject,
  busy,
}: {
  event: AdminPendingEvent;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] py-3 text-sm">
      <div>
        <Link href={adminRoutes.event(event._id)} className="font-medium text-zinc-200 hover:text-[#FF3EA5]">
          {event.title}
        </Link>
        <p className="text-xs text-zinc-600">
          {(event.organizer as { businessName?: string })?.businessName ?? "—"} · {event.city}
        </p>
      </div>
      <div className="flex gap-1">
        <Button size="sm" onClick={onApprove} disabled={busy}>
          Approve
        </Button>
        <Button size="sm" variant="secondary" onClick={onReject} disabled={busy}>
          Reject
        </Button>
      </div>
    </div>
  );
}
