import { CoverImage } from "@/components/media/cover-image";
import Link from "next/link";
import { routes } from "@/config/routes";
import type { EventDetail } from "@/types/models/event";

export function EventOrganizerSection({ event }: { event: EventDetail }) {
  const org = event.organizer;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Organizer</h2>
      <div className="glass-panel flex items-center gap-5 rounded-2xl p-6">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-card">
          {org.logo ? (
            <CoverImage src={org.logo} alt={org.businessName} fill />
          ) : (
            <span className="flex h-full items-center justify-center text-2xl font-bold text-primary-neon">
              {org.businessName.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold">{org.businessName}</p>
          <p className="mt-1 text-sm text-zinc-500">Verified event partner on Eventisa</p>
          <Link
            href={routes.organizerProfile(org.slug)}
            className="mt-2 inline-block text-sm text-primary-neon hover:underline"
          >
            More events from this organizer
          </Link>
        </div>
      </div>
    </section>
  );
}
