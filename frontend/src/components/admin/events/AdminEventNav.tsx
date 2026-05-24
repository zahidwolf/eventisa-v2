"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminRoutes } from "@/config/admin-routes";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", href: adminRoutes.eventOverview },
  { id: "bookings", label: "Bookings", href: adminRoutes.eventBookings },
  { id: "attendees", label: "Attendees", href: adminRoutes.eventAttendees },
  { id: "segments", label: "Segments", href: adminRoutes.eventSegments },
  { id: "checkin", label: "Check-in", href: adminRoutes.eventCheckin },
  { id: "promo-codes", label: "Promo Codes", href: adminRoutes.eventPromoCodes },
  { id: "analytics", label: "Analytics", href: adminRoutes.eventAnalytics },
] as const;

function isActive(pathname: string, eventId: string, tabId: string) {
  if (tabId === "overview") return pathname === adminRoutes.eventOverview(eventId);
  return pathname.includes(`/admin/events/${eventId}/${tabId}`);
}

export function AdminEventNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = TABS.find((t) => isActive(pathname, eventId, t.id)) ?? TABS[0];

  return (
    <>
      <nav className="hidden gap-1 border-b border-white/[0.08] md:flex">
        {TABS.map((tab) => {
          const href = tab.href(eventId);
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive(pathname, eventId, tab.id)
                  ? "border-[#FF3EA5] text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <select
        className="h-10 w-full rounded-md border border-white/10 bg-surface-card px-3 text-sm text-white md:hidden"
        value={active.id}
        onChange={(e) => {
          const tab = TABS.find((t) => t.id === e.target.value);
          if (tab) router.push(tab.href(eventId));
        }}
        aria-label="Event section"
      >
        {TABS.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.label}
          </option>
        ))}
      </select>
    </>
  );
}
