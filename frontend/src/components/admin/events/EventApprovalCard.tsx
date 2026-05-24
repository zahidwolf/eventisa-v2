"use client";

import { CoverImage } from "@/components/media/cover-image";
import type { AdminPendingEvent } from "@/services/admin/admin-dashboard.service";
import { AdminEventActions } from "@/components/admin/events/AdminEventActions";

export function EventApprovalCard({
  event,
  onChanged,
}: {
  event: AdminPendingEvent & {
    ticketSections?: { title?: string; price?: number }[];
    segmentCount?: number;
  };
  onChanged?: () => void;
}) {
  const org = event.organizer as { businessName?: string } | undefined;
  const sections = event.ticketSections ?? [];

  return (
    <article className="glass-panel overflow-hidden rounded-2xl border border-white/[0.08]">
      <div className="relative h-36 bg-surface-card">
        {event.coverImage ? (
          <CoverImage src={event.coverImage} alt="" fill sizes="400px" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">No banner</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-white">{event.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {org?.businessName ?? "Unknown organizer"} · {event.category} · {event.city}
        </p>
        {event.startDate && (
          <p className="mt-1 text-xs text-zinc-600">
            {new Date(event.startDate).toLocaleString()}
          </p>
        )}
        <p className="mt-2 text-xs text-zinc-500">
          {sections.length || event.segmentCount || 0} segment(s)
          {sections.slice(0, 2).map((s, i) => (
            <span key={i} className="ml-2">
              {s.title}: ৳{s.price}
            </span>
          ))}
        </p>
        <div className="mt-4">
          <AdminEventActions
            eventId={event._id}
            slug={event.slug}
            status="pending"
            approvalStatus="pending"
            onChanged={onChanged}
          />
        </div>
      </div>
    </article>
  );
}
