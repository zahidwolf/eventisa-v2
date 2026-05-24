"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Ticket,
  Users,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  RotateCcw,
  Clock,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { fetchAdminDashboard } from "@/services/admin/admin-dashboard.service";
import { adminRoutes } from "@/config/admin-routes";
import { Button } from "@/components/ui/button";

export function AdminDashboardView() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
    retry: 1,
  });

  if (isLoading) {
    return <p className="text-zinc-500">Loading dashboard…</p>;
  }

  if (isError || !data?.data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-red-400">Could not load dashboard</p>
        <p className="mt-2 text-sm text-zinc-500">
          Ensure backend is running on port 5001 and you are logged in at /admin/login
        </p>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { metrics, widgets } = data.data;

  return (
    <div>
      <AdminPageHeader
        title="Control center"
        description="Full platform overview — revenue, events, and moderation queue"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Today's revenue" value={`৳${metrics.todayRevenue.toLocaleString()}`} icon={TrendingUp} />
        <AdminStatCard label="Monthly revenue" value={`৳${metrics.monthlyRevenue.toLocaleString()}`} icon={CreditCard} accent="purple" />
        <AdminStatCard label="Total events" value={metrics.totalEvents} icon={Calendar} accent="blue" />
        <AdminStatCard label="Pending approvals" value={metrics.pendingApprovals} icon={Clock} />
        <AdminStatCard label="Active organizers" value={metrics.activeOrganizers} icon={Users} accent="green" />
        <AdminStatCard label="Tickets sold" value={metrics.ticketsSold} icon={Ticket} accent="purple" />
        <AdminStatCard label="Failed payments" value={metrics.failedPayments} icon={AlertTriangle} />
        <AdminStatCard label="Refund requests" value={metrics.refundRequests} icon={RotateCcw} accent="blue" />
      </div>
      <div className="mt-8">
        <AdminDashboardCharts data={data.data} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Pending event approvals</h3>
            <Button size="sm" variant="secondary" asChild>
              <Link href={adminRoutes.eventsPending}>View all</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {widgets.pendingEvents.map((e) => (
              <li key={e._id} className="flex justify-between text-sm">
                <Link href={adminRoutes.event(e._id)} className="text-zinc-300 hover:text-[#FF3EA5]">
                  {e.title}
                </Link>
                <span className="text-zinc-600">{e.city}</span>
              </li>
            ))}
            {!widgets.pendingEvents.length && (
              <li className="text-sm text-zinc-600">No pending events</li>
            )}
          </ul>
        </div>
        <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
          <h3 className="font-semibold text-white">Recent activity</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {widgets.recentActivity.map((o) => (
              <li key={o.orderId} className="flex justify-between text-zinc-400">
                <span>{o.guestName}</span>
                <span className="text-[#FF3EA5]">৳{o.total?.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
