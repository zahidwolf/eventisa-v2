"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizerLogo } from "@/components/organizers/organizer-logo";
import { InitialAvatar } from "@/components/shared/InitialAvatar";
import { routes } from "@/config/routes";
import type { OrganizerShowcaseItem } from "@/types/models/organizer-showcase";

function OrganizerCard({ organizer }: { organizer: OrganizerShowcaseItem }) {
  return (
    <Link
      href={routes.organizerProfile(organizer.slug)}
      className="group flex w-[96px] shrink-0 flex-col items-center gap-2.5 sm:w-[112px] md:w-[128px]"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-all group-hover:border-[#FF3EA5]/50 group-hover:shadow-[0_0_20px_-4px_rgba(255,62,165,0.35)] sm:h-[72px] sm:w-[72px]">
        {organizer.logo ? (
          <OrganizerLogo src={organizer.logo} alt={organizer.name} sizes="72px" />
        ) : (
          <InitialAvatar name={organizer.name} size="lg" className="h-full w-full" />
        )}
      </div>
      <span className="line-clamp-2 w-full text-center text-xs font-medium text-zinc-400 transition-colors group-hover:text-zinc-200 sm:text-sm">
        {organizer.name}
      </span>
    </Link>
  );
}

function TickerRow({ children, durationSeconds }: { children: React.ReactNode; durationSeconds: number }) {
  return (
    <div className="organizer-ticker-mask w-full overflow-hidden py-3">
      <div
        className="organizer-ticker-track flex w-max"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <div className="flex shrink-0 items-start gap-10 px-6 sm:gap-12 sm:px-8 md:gap-14 md:px-10">
          {children}
        </div>
        <div className="flex shrink-0 items-start gap-10 px-6 sm:gap-12 sm:px-8 md:gap-14 md:px-10" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export function OrganizerTickerLoading() {
  const skeletons = Array.from({ length: 10 }, (_, i) => (
    <div key={i} className="flex w-[96px] shrink-0 flex-col items-center gap-2.5 sm:w-[112px]">
      <Skeleton className="h-16 w-16 rounded-full sm:h-[72px] sm:w-[72px]" />
      <Skeleton className="h-3 w-20" />
    </div>
  ));
  return <TickerRow durationSeconds={40}>{skeletons}</TickerRow>;
}

/** Repeat organizers so the marquee stays full on wide screens */
function expandForMarquee(organizers: OrganizerShowcaseItem[], minItems = 12): OrganizerShowcaseItem[] {
  if (organizers.length === 0) return [];
  const repeats = Math.max(2, Math.ceil(minItems / organizers.length));
  return Array.from({ length: repeats }, () => organizers).flat();
}

export function OrganizerTicker({ organizers }: { organizers: OrganizerShowcaseItem[] }) {
  const items = expandForMarquee(organizers);
  const cards = items.map((o, i) => <OrganizerCard key={`${o._id}-${i}`} organizer={o} />);
  const duration = Math.max(24, items.length * 4);

  return <TickerRow durationSeconds={duration}>{cards}</TickerRow>;
}
