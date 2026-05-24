"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar, Receipt, Settings, Ticket } from "lucide-react";
import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDate } from "@/lib/events/event-utils";
import { venueLabel } from "@/lib/user/order-display";
import { fetchDashboardStats, fetchUserTickets } from "@/services/user/user-dashboard.service";
import {
  USER_DASHBOARD_STALE_MS,
  USER_TICKET_LIST_STALE_MS,
} from "@/lib/buyer-query";
import { useAuthStore } from "@/store/auth.store";

const QUICK_LINKS = [
  { title: "My Tickets", href: "/dashboard/tickets", icon: Ticket },
  { title: "Order History", href: "/dashboard/orders", icon: Receipt },
  { title: "Account Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export default function DashboardOverviewPage() {
  const user = useAuthStore((s) => s.user);

  const { data: stats } = useQuery({
    queryKey: ["user-dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: USER_DASHBOARD_STALE_MS,
  });

  const { data: upcoming } = useQuery({
    queryKey: ["user-upcoming-preview"],
    queryFn: () => fetchUserTickets({ status: "upcoming", limit: 3 }),
    staleTime: USER_TICKET_LIST_STALE_MS,
  });

  const statCards = [
    { label: "Total Tickets", value: stats?.totalTickets ?? 0, icon: "🎟️" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: "📦" },
    { label: "Upcoming Events", value: stats?.upcomingEvents ?? 0, icon: "⏰" },
    { label: "Events Attended", value: stats?.eventsAttended ?? 0, icon: "✅" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Your tickets, orders, and account in one place.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon }) => (
          <Card key={label} className="glass-panel border-white/[0.08]">
            <CardHeader className="pb-2">
              <p className="text-lg">{icon}</p>
              <CardTitle className="text-3xl font-bold text-white">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ title, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-[#FF3EA5]/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF3EA5]/15 text-[#FF3EA5]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-medium text-white">{title}</span>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Upcoming events</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/tickets">View all</Link>
          </Button>
        </div>
        {!upcoming?.data?.length && !upcoming?.orders?.length ? (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            No upcoming tickets. <Link href="/events" className="text-[#FF3EA5]">Browse events</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {(upcoming.data ?? upcoming.orders ?? []).map((order) => (
              <div
                key={order._id}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                  {order.event.bannerImage ?? order.event.coverImage ? (
                    <CoverImage
                      src={(order.event.bannerImage ?? order.event.coverImage)!}
                      alt=""
                      fill
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{order.event.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {formatEventDate(order.event.startDate, "long")}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {venueLabel(order.event.venue.name)} · {order.segment.name}
                  </p>
                </div>
                <Button size="sm" className="shrink-0 self-center" asChild>
                  <Link href={`/dashboard/tickets?orderId=${order._id}`}>View Ticket</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
