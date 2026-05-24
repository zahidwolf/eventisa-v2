"use client";

import Link from "next/link";
import { formatBDT, formatTimeAgo } from "@/lib/formatCurrency";
import { adminRoutes } from "@/config/admin-routes";
import type { RecentActivity as RecentActivityData } from "@/types/adminAnalytics.types";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: "bg-emerald-500/15 text-emerald-400",
    pending: "bg-yellow-500/15 text-yellow-400",
    approved: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
    draft: "bg-zinc-500/15 text-zinc-400",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs capitalize", styles[status] ?? "bg-zinc-500/15 text-zinc-400")}>
      {status}
    </span>
  );
}

function Column({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-white">{title}</h3>
        <Link href={href} className="text-xs text-[#FF3EA5] hover:underline">
          View all
        </Link>
      </div>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

export function RecentActivity({
  data,
  loading,
}: {
  data?: RecentActivityData;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Column title="Recent orders" href={adminRoutes.orders}>
        {(data?.recentOrders ?? []).map((o) => (
          <li key={o.orderId} className="border-b border-white/5 pb-3 last:border-0">
            <p className="font-medium text-white">{o.buyerName}</p>
            <p className="text-xs text-zinc-500">{o.eventTitle}</p>
            <p className="mt-1 flex justify-between text-xs">
              <span className="text-[#FF3EA5]">{formatBDT(o.amount)}</span>
              <span className="text-zinc-600">{formatTimeAgo(o.createdAt)}</span>
            </p>
          </li>
        ))}
        {(!data?.recentOrders?.length) && (
          <li className="text-sm text-zinc-500">No recent orders</li>
        )}
      </Column>
      <Column title="Recent events" href={adminRoutes.events}>
        {(data?.recentEvents ?? []).map((e) => (
          <li key={e.eventId} className="border-b border-white/5 pb-3 last:border-0">
            <p className="font-medium text-white">{e.title}</p>
            <p className="text-xs text-zinc-500">{e.organizerName}</p>
            <p className="mt-1 flex items-center justify-between gap-2">
              <StatusBadge status={e.status} />
              <span className="text-xs text-zinc-600">{formatTimeAgo(e.createdAt)}</span>
            </p>
          </li>
        ))}
        {(!data?.recentEvents?.length) && (
          <li className="text-sm text-zinc-500">No recent events</li>
        )}
      </Column>
      <Column title="Recent organizers" href={adminRoutes.organizers}>
        {(data?.recentOrganizers ?? []).map((o) => (
          <li key={o.organizerId} className="border-b border-white/5 pb-3 last:border-0">
            <p className="font-medium text-white">{o.name}</p>
            <p className="text-xs text-zinc-500">{o.orgName}</p>
            <p className="mt-1 flex items-center justify-between gap-2">
              <StatusBadge status={o.approvalStatus} />
              <span className="text-xs text-zinc-600">{formatTimeAgo(o.createdAt)}</span>
            </p>
          </li>
        ))}
        {(!data?.recentOrganizers?.length) && (
          <li className="text-sm text-zinc-500">No recent applications</li>
        )}
      </Column>
    </div>
  );
}
