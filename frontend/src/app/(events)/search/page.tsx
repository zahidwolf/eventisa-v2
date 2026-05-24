"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { trackEvent } from "@/lib/tracking/metaPixel";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { Input } from "@/components/ui/input";
import { EventsGrid } from "@/components/events/events-grid";
import { EmptySearch } from "@/components/empty-states/empty-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { fetchEvents } from "@/services/events/events.service";
import { filterAndSortEvents } from "@/lib/events/filter-events";

function SearchContent() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const debouncedQ = useDebouncedValue(q);

  const { data, isLoading } = useQuery({
    queryKey: ["events-search"],
    queryFn: () => fetchEvents({ limit: 50 }),
  });

  const events = useMemo(() => {
    const raw = data?.data.events ?? [];
    return filterAndSortEvents(
      raw,
      {
        q: debouncedQ,
        city: params.get("city") ?? undefined,
        category: params.get("category") ?? undefined,
        date: params.get("date") ?? undefined,
      },
      "popular"
    );
  }, [data, debouncedQ, params]);

  useEffect(() => {
    if (debouncedQ.trim().length >= 2) {
      trackEvent("Search", { search_string: debouncedQ.trim() });
    }
  }, [debouncedQ]);

  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl font-bold">Search events</h1>
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <Input
            className="h-12 pl-11"
            placeholder="Concert, city, festival…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="mt-10">
          {!isLoading && !events.length ? (
            <EmptySearch query={debouncedQ} />
          ) : (
            <EventsGrid events={events} isLoading={isLoading} />
          )}
        </div>
      </Container>
    </Section>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading search…</div>}>
      <SearchContent />
    </Suspense>
  );
}
