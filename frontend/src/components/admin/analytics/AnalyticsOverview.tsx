"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { GrowthBadge } from "@/components/admin/analytics/GrowthBadge";
import { formatBDT, formatNumber } from "@/lib/formatCurrency";
import { adminRoutes } from "@/config/admin-routes";
import type { PlatformOverview } from "@/types/adminAnalytics.types";

function StatWithBadge({
  label,
  value,
  icon: Icon,
  accent,
  badge,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  accent?: "pink" | "purple" | "blue" | "green";
  badge?: React.ReactNode;
  sub?: string;
}) {
  const accentClass =
    accent === "green"
      ? "bg-emerald-400/10 text-emerald-400"
      : accent === "blue"
        ? "bg-[#4F8CFF]/10 text-[#4F8CFF]"
        : accent === "purple"
          ? "bg-[#9B5CFF]/10 text-[#9B5CFF]"
          : "bg-[#FF3EA5]/10 text-[#FF3EA5]";

  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
          {badge && <div className="mt-2">{badge}</div>}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function AnalyticsOverview({
  data,
  loading,
}: {
  data?: PlatformOverview;
  loading?: boolean;
}) {
  if (loading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatWithBadge
          label="Total revenue"
          value={formatBDT(data.totalRevenue)}
          icon={TrendingUp}
        />
        <StatWithBadge
          label="This month"
          value={formatBDT(data.revenueThisMonth)}
          icon={Wallet}
          badge={<GrowthBadge percent={data.revenueGrowthPercent} />}
        />
        <AdminStatCard label="Today's revenue" value={formatBDT(data.todayRevenue)} icon={Wallet} />
        <AdminStatCard label="Avg order value" value={formatBDT(data.avgOrderValue)} icon={ShoppingBag} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Tickets sold"
          value={formatNumber(data.totalTicketsSold)}
          icon={Ticket}
          accent="purple"
        />
        <AdminStatCard label="Total orders" value={formatNumber(data.totalOrders)} icon={ShoppingBag} />
        <AdminStatCard label="Today's tickets" value={formatNumber(data.todayTickets)} icon={Ticket} accent="pink" />
        <AdminStatCard label="Today's orders" value={formatNumber(data.todayOrders)} icon={Clock} accent="blue" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatWithBadge
          label="Total users"
          value={formatNumber(data.totalUsers)}
          icon={Users}
          accent="blue"
          sub={`+${data.newUsersThisMonth} this month`}
        />
        <AdminStatCard
          label="Organizers"
          value={formatNumber(data.approvedOrganizers)}
          icon={Building2}
          accent="green"
        />
        <AdminStatCard label="Live events" value={formatNumber(data.liveEvents)} icon={Calendar} accent="purple" />
        <Link href={adminRoutes.eventsPending} className="block">
          <AdminStatCard
            label="Pending approvals"
            value={formatNumber(data.pendingApproval)}
            icon={Calendar}
            accent="pink"
          />
        </Link>
      </div>
    </div>
  );
}
