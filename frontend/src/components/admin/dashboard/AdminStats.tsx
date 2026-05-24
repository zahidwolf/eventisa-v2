import { Calendar, Ticket, Users, Building2, TrendingUp, Zap } from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import type { AdminDashboardData } from "@/services/admin/admin-dashboard.service";

export function AdminStats({ metrics }: { metrics: AdminDashboardData["metrics"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <AdminStatCard label="Total users" value={metrics.totalUsers ?? "—"} icon={Users} accent="blue" />
      <AdminStatCard
        label="Organizers"
        value={metrics.totalOrganizers ?? metrics.activeOrganizers}
        icon={Building2}
        accent="green"
      />
      <AdminStatCard
        label="Published events"
        value={metrics.publishedEvents ?? metrics.liveEvents}
        icon={Calendar}
        accent="purple"
      />
      <AdminStatCard
        label="Total revenue"
        value={`৳${(metrics.totalRevenue ?? 0).toLocaleString()}`}
        icon={TrendingUp}
      />
      <AdminStatCard label="Tickets sold" value={metrics.ticketsSold} icon={Ticket} accent="pink" />
      <AdminStatCard
        label="Active events"
        value={metrics.activeEvents ?? metrics.liveEvents}
        icon={Zap}
        accent="green"
      />
    </div>
  );
}
