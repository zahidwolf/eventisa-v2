"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AdminCharts } from "@/components/admin/dashboard/AdminCharts";
import { AdminPendingQueue } from "@/components/admin/dashboard/AdminPendingQueue";
import { AdminRecentActivity } from "@/components/admin/dashboard/AdminRecentActivity";
import { AdminStats } from "@/components/admin/dashboard/AdminStats";
import { fetchAdminDashboard } from "@/services/admin/admin-dashboard.service";

export function AdminDashboardView() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
    retry: 1,
  });

  if (isLoading) return <p className="text-zinc-500">Loading dashboard…</p>;

  if (isError || !data?.data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-red-400">Could not load dashboard</p>
        <p className="mt-2 text-sm text-zinc-500">Ensure backend is running and you are logged in at /admin/login</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const payload = data.data;

  return (
    <div className="space-y-8">
      <AdminStats metrics={payload.metrics} />
      <AdminCharts charts={payload.charts} />
      <AdminPendingQueue widgets={payload.widgets} />
      <AdminRecentActivity items={payload.widgets.activityFeed ?? []} />
    </div>
  );
}
