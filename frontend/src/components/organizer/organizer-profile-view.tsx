import Link from "next/link";
import { CoverImage } from "@/components/media/cover-image";
import { BadgeCheck, Users } from "lucide-react";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { routes } from "@/config/routes";
import { formatEventDate } from "@/lib/events/event-utils";
import type { OrganizerPublicProfile } from "@/types/models/organizer";

export function OrganizerProfileView({ data }: { data: OrganizerPublicProfile }) {
  const { organizer, pastEvents } = data;

  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <div className="relative aspect-[21/7] bg-hero-luxury">
            {organizer.banner ? (
              <CoverImage src={organizer.banner} alt="" fill className="object-cover opacity-80" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent" />
          </div>
          <div className="relative -mt-12 flex flex-col gap-4 px-6 pb-8 md:flex-row md:items-end">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-surface-card">
              {organizer.logo ? (
                <CoverImage src={organizer.logo} alt={organizer.businessName} fill className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-3xl font-bold text-primary-neon">
                  {organizer.businessName.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold">{organizer.businessName}</h1>
                {organizer.isVerified && (
                  <BadgeCheck className="h-6 w-6 text-primary-neon" aria-label="Verified" />
                )}
              </div>
              <p className="mt-1 capitalize text-zinc-500">{organizer.organizerType ?? "organizer"}</p>
              {organizer.university?.universityName && (
                <p className="text-sm text-zinc-400">
                  {organizer.university.universityName}
                  {organizer.university.department ? ` · ${organizer.university.department}` : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Users className="h-4 w-4" />
              {(organizer.followerCount ?? 0).toLocaleString()} followers
            </div>
          </div>
        </div>

        {organizer.description && (
          <p className="mt-8 max-w-3xl text-zinc-400">{organizer.description}</p>
        )}

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Past events</h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {pastEvents.length ? (
              pastEvents.map((e) => (
                <Link
                  key={e.slug}
                  href={routes.event(e.slug)}
                  className="w-[min(85vw,280px)] shrink-0 snap-center overflow-hidden rounded-xl border border-white/10 bg-surface-card/90 card-lift"
                >
                  {e.coverImage && (
                    <div className="relative aspect-video">
                      <CoverImage src={e.coverImage} alt="" fill sizes="280px" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold line-clamp-2">{e.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatEventDate(e.startDate)} · {e.city}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-500">No public events yet.</p>
            )}
          </div>
        </div>

        <Link href={routes.events} className="mt-8 inline-block text-sm text-primary-neon hover:underline">
          Browse all events
        </Link>
      </Container>
    </Section>
  );
}
