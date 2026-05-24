"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", href: (id: string) => routes.organizer.eventOverview(id) },
  { id: "edit", label: "Edit", href: (id: string) => routes.organizer.editEvent(id) },
  { id: "attendees", label: "Attendees", href: (id: string) => routes.organizer.eventAttendees(id) },
  { id: "checkin", label: "Check-in", href: (id: string) => routes.organizer.eventCheckin(id) },
  { id: "promo-codes", label: "Promo Codes", href: (id: string) => routes.organizer.eventPromoCodes(id) },
  { id: "analytics", label: "Analytics", href: (id: string) => routes.organizer.eventAnalytics(id) },
] as const;

function tabActive(pathname: string, eventId: string, tabId: string) {
  if (tabId === "overview") {
    return pathname === routes.organizer.eventOverview(eventId);
  }
  return pathname.includes(`/organizer/events/${eventId}/${tabId}`);
}

interface EventManageNavProps {
  eventId: string;
}

const mobileSelectClass = cn(
  "h-10 w-full rounded-md border border-white/10 bg-surface-card px-3 text-sm text-white",
  "focus:border-[#FF3EA5]/50 focus:outline-none focus:ring-1 focus:ring-[#FF3EA5]/30"
);

export function EventManageNav({ eventId }: EventManageNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active = TABS.find((t) => tabActive(pathname, eventId, t.id)) ?? TABS[0];

  return (
    <>
      <nav className="hidden gap-1 border-b border-white/[0.08] md:flex">
        {TABS.map((tab) => {
          const href = tab.href(eventId);
          const isActive = tabActive(pathname, eventId, tab.id);
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#FF3EA5] text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="md:hidden">
        <select
          value={active.id}
          onChange={(e) => {
            const tab = TABS.find((t) => t.id === e.target.value);
            if (tab) router.push(tab.href(eventId));
          }}
          className={mobileSelectClass}
          aria-label="Event section"
        >
          {TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
