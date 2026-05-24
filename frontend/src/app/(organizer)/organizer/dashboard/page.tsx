"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, Plus, ScanLine, Users } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { ORGANIZER_DASHBOARD_STALE_MS } from "@/lib/organizer-query";
import { fetchOrganizerDashboardStats } from "@/services/organizer/organizer-dashboard.service";
import { fetchOrganizerEvents } from "@/services/organizer/organizer-events.service";

function formatBdt(n: number) {
  return `৳${n.toLocaleString("en-BD")}`;
}

export default function OrganizerDashboardPage() {
  const statsQ = useQuery({
    queryKey: ["organizer-dashboard-stats"],
    queryFn: fetchOrganizerDashboardStats,
    staleTime: ORGANIZER_DASHBOARD_STALE_MS,
  });

  const recentQ = useQuery({
    queryKey: ["organizer-events", "dashboard-recent"],
    queryFn: () => fetchOrganizerEvents({ limit: 5, sort: "newest", page: 1 }),
  });

  const stats = statsQ.data;
  const events = recentQ.data?.data.events ?? [];
  const isLoading = statsQ.isLoading;

  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Organizer dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Manage events, attendees, check-in, and promo codes from one hub.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Events", value: isLoading ? "—" : String(stats?.totalEvents ?? 0) },
          { label: "Tickets sold", value: isLoading ? "—" : String(stats?.totalTicketsSold ?? 0) },
          { label: "Revenue", value: isLoading ? "—" : formatBdt(stats?.totalRevenue ?? 0) },
          {
            label: "Upcoming events",
            value: isLoading ? "—" : String(stats?.upcomingEvents ?? 0),
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="mt-2 font-display text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Checked in", value: isLoading ? "—" : String(stats?.totalCheckedIn ?? 0) },
          { label: "Pending payouts", value: isLoading ? "—" : formatBdt(stats?.pendingPayouts ?? 0) },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="mt-2 font-display text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel border-white/[0.08]">
          <CardHeader>
            <Calendar className="mb-2 h-5 w-5 text-[#FF3EA5]" />
            <CardTitle className="text-base text-white">Your events</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={routes.organizer.events}>View all events</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/[0.08]">
          <CardHeader>
            <Plus className="mb-2 h-5 w-5 text-[#9B5CFF]" />
            <CardTitle className="text-base text-white">Create event</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={routes.organizer.createEvent}>New event</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/[0.08]">
          <CardHeader>
            <BarChart3 className="mb-2 h-5 w-5 text-[#FF3EA5]" />
            <CardTitle className="text-base text-white">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href={routes.organizer.analytics}>Platform analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 glass-panel rounded-2xl border border-white/[0.08] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-white">Recent events</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.organizer.events}>See all</Link>
          </Button>
        </div>
        {recentQ.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No events yet. Create your first event to get started.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {events.map((ev) => (
              <li key={ev._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link
                  href={routes.organizer.eventOverview(ev._id)}
                  className="font-medium text-white hover:text-[#FF3EA5]"
                >
                  {ev.title}
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={routes.organizer.eventAttendees(ev._id)}>
                      <Users className="mr-1 h-3.5 w-3.5" />
                      Attendees
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={routes.organizer.eventCheckin(ev._id)}>
                      <ScanLine className="mr-1 h-3.5 w-3.5" />
                      Check-in
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
