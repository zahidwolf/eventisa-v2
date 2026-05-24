"use client";

import Link from "next/link";
import { Container } from "@/components/common/container";
import { OrganizerTicker } from "@/components/home/OrganizerTicker";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { glass } from "@/design-system/glass";
import type { OrganizerShowcaseItem } from "@/types/models/organizer-showcase";

const ORGANIZER_REGISTER_HREF = routes.organizer.register;

export function OrganizerShowcase({ organizers }: { organizers: OrganizerShowcaseItem[] }) {
  if (organizers.length === 0) return null;

  return (
    <section className="py-8 md:py-16">
      <Container>
        <div className={cn("organizer-showcase-glass overflow-hidden", glass.glow)}>
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#FF3EA5]/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[#9B5CFF]/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent"
            aria-hidden
          />

          <div className="relative flex flex-col items-center px-4 py-6 text-center sm:px-6 md:px-10 md:py-10">
            <div className="mb-4 max-w-2xl md:mb-8">
              <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
                Trusted by Top Organizers
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Leading event creators across Bangladesh
              </p>
            </div>
          </div>

          {/* Full-width horizontal marquee — edge to edge inside glass panel */}
          <div className="relative w-full pb-6 md:pb-10">
            <OrganizerTicker organizers={organizers} />
          </div>

          <div className="relative flex justify-center px-4 pb-6 md:px-10 md:pb-10">
            <Button size="lg" className="shadow-[0_0_24px_-4px_rgba(255,62,165,0.45)]" asChild>
              <Link href={ORGANIZER_REGISTER_HREF}>Become an Organizer</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
