"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ScanLine } from "lucide-react";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { fetchOrganizerEvents } from "@/services/organizer/organizer-events.service";
import { routes } from "@/config/routes";

export default function OrganizerCheckInPage() {
  const { data: eventsRes, isLoading } = useQuery({
    queryKey: ["organizer-events-checkin-hub"],
    queryFn: () => fetchOrganizerEvents(),
  });

  const events = eventsRes?.data.events ?? [];

  return (
    <Section>
      <Container size="narrow">
        <h1 className="font-display text-3xl font-bold">Event check-in</h1>
        <p className="mt-2 text-zinc-500">
          Select an event to open the camera scanner. Each event has its own check-in page with QR
          scan, manual lookup, and stats.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-zinc-500">Loading events…</p>
        ) : events.length === 0 ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-surface-elevated p-6 text-center">
            <p className="text-zinc-400">No events yet.</p>
            <Button asChild className="mt-4">
              <Link href={routes.organizer.events}>Go to events</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {events.map((event) => (
              <li key={event._id}>
                <Link
                  href={routes.organizer.eventCheckin(event._id)}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface-elevated px-4 py-4 transition hover:border-[#FF3EA5]/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="text-xs text-zinc-500 capitalize">{event.status}</p>
                  </div>
                  <ScanLine className="h-5 w-5 shrink-0 text-[#FF3EA5]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
