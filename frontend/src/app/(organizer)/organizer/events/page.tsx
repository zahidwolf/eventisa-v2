"use client";

import Link from "next/link";
import { Container } from "@/components/common/container";
import { OrganizerEventList } from "@/components/organizer/events/OrganizerEventList";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function OrganizerEventsPage() {
  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Your events</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage attendees, check-in, promo codes, and analytics per event.
          </p>
        </div>
        <Button asChild>
          <Link href={routes.organizer.createEvent}>Create event</Link>
        </Button>
      </div>
      <div className="mt-8">
        <OrganizerEventList />
      </div>
    </Container>
  );
}
