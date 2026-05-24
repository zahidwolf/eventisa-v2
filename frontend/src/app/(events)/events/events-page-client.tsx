"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { EventsGrid } from "@/components/events/events-grid";
import { EventFiltersPanel } from "@/components/events/event-filters-panel";
import { EmptySearch } from "@/components/empty-states/empty-search";
import { Button } from "@/components/ui/button";
import { fetchEvents } from "@/services/events/events.service";
import { getApiErrorMessage } from "@/services/api/client";
import { filterAndSortEvents, type EventFilters, type SortOption } from "@/lib/events/filter-events";
import type { EventListItem } from "@/types/models/event";

interface EventsPageClientProps {
  initialEvents?: EventListItem[];
}

export function EventsPageClient({ initialEvents = [] }: EventsPageClientProps) {
  const params = useSearchParams();
  const [filters, setFilters] = useState<EventFilters>({
    city: params.get("city") ?? undefined,
    category: params.get("category") ?? undefined,
  });
  const [sort, setSort] = useState<SortOption>("popular");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["events", filters.city, filters.category],
    queryFn: () => fetchEvents({ city: filters.city, category: filters.category, limit: 50 }),
    initialData: initialEvents.length
      ? {
          success: true,
          data: { events: initialEvents, pagination: { total: initialEvents.length, page: 1, limit: 50 } },
        }
      : undefined,
    staleTime: 30_000,
  });

  const events = useMemo(() => {
    const raw = data?.data?.events ?? [];
    return filterAndSortEvents(raw, filters, sort);
  }, [data, filters, sort]);

  const hasActiveFilters =
    !!filters.city ||
    !!filters.category ||
    !!filters.date ||
    !!filters.today ||
    !!filters.weekend ||
    !!filters.trending ||
    !!filters.freeOnly;

  return (
    <Section>
      <Container>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            <span className="text-gradient-luxury">Discover</span> events
          </h1>
          <p className="mt-3 text-zinc-500">Filter by city, date, price & more</p>
        </motion.div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <EventFiltersPanel
            filters={filters}
            sort={sort}
            onChange={(f, s) => {
              setFilters(f);
              setSort(s);
            }}
          />
          <div>
            {isError ? (
              <div className="flex flex-col items-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <h3 className="mt-4 font-display text-xl font-semibold">Could not load events</h3>
                <p className="mt-2 max-w-md text-sm text-zinc-500">{getApiErrorMessage(error)}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  Make sure the backend is running:{" "}
                  <code className="text-zinc-400">cd backend && npm run dev</code> (port 5001)
                </p>
                <Button className="mt-6" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            ) : !isLoading && !events.length ? (
              <EmptySearch hasFilters={hasActiveFilters} onClearFilters={() => setFilters({})} />
            ) : (
              <EventsGrid events={events} isLoading={isLoading} />
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
