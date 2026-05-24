import Link from "next/link";
import { CoverImage } from "@/components/media/cover-image";
import {
  BarChart3,
  Pencil,
  ScanLine,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/organizer/events/event-status-badge";
import { routes } from "@/config/routes";
import type { OrganizerEventListItem } from "@/types/organizer-event-management";

function formatBdt(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface OrganizerEventCardProps {
  event: OrganizerEventListItem;
}

export function OrganizerEventCard({ event }: OrganizerEventCardProps) {
  const capacity = event.capacity ?? event.totalCapacity ?? 0;

  const actions = [
    { label: "Edit", href: routes.organizer.editEvent(event._id), icon: Pencil },
    { label: "Attendees", href: routes.organizer.eventAttendees(event._id), icon: Users },
    { label: "Check-in", href: routes.organizer.eventCheckin(event._id), icon: ScanLine },
    { label: "Promo", href: routes.organizer.eventPromoCodes(event._id), icon: Tag },
    { label: "Analytics", href: routes.organizer.eventAnalytics(event._id), icon: BarChart3 },
  ] as const;

  return (
    <article className="glass-panel overflow-hidden rounded-2xl border border-white/[0.08]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
        <Link
          href={routes.organizer.eventOverview(event._id)}
          className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-surface-card sm:h-auto sm:w-40"
        >
          {event.coverImage ? (
            <CoverImage src={event.coverImage} alt="" fill sizes="160px" />
          ) : (
            <div className="flex h-full min-h-[8rem] items-center justify-center bg-gradient-to-br from-[#FF3EA5]/20 to-[#9B5CFF]/10 text-sm text-zinc-500">
              No banner
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                href={routes.organizer.eventOverview(event._id)}
                className="font-display text-lg font-semibold text-white hover:text-[#FF3EA5]"
              >
                {event.title}
              </Link>
              <p className="mt-1 text-sm text-zinc-500">{formatEventDate(event.startDate)}</p>
            </div>
            <EventStatusBadge status={event.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-zinc-500">Tickets sold</p>
              <p className="font-medium text-white">
                {event.ticketsSold} / {capacity}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Revenue</p>
              <p className="font-medium text-white">{formatBdt(event.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Segments</p>
              <p className="font-medium text-white">{event.segmentCount}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Checked in</p>
              <p className="font-medium text-white">{event.checkedInCount}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map(({ label, href, icon: Icon }) => (
              <Button key={label} variant="secondary" size="sm" asChild>
                <Link href={href}>
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
