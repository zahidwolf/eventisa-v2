"use client";

import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { OrganizerAnalyticsCharts } from "@/components/analytics/organizer-analytics-charts";
import { fetchOrganizerAnalytics } from "@/services/analytics/analytics.service";
import { ORGANIZER_DASHBOARD_STALE_MS } from "@/lib/organizer-query";

export default function OrganizerAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["organizer-analytics"],
    queryFn: () => fetchOrganizerAnalytics(),
    staleTime: ORGANIZER_DASHBOARD_STALE_MS,
  });

  const analytics = (data?.data ?? {}) as Parameters<typeof OrganizerAnalyticsCharts>[0]["data"];

  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-zinc-500">Tickets, revenue, attendance & check-in</p>
        <div className="mt-10">
          {isLoading ? (
            <p className="text-zinc-500">Loading metrics…</p>
          ) : (
            <OrganizerAnalyticsCharts data={analytics} />
          )}
        </div>
      </Container>
    </Section>
  );
}
