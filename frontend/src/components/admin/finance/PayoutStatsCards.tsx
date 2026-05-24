"use client";

import { Clock, CheckCircle, Wallet, TrendingUp } from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { formatBDT } from "@/lib/formatCurrency";
import type { AdminPayoutStats } from "@/types/payout.types";

interface PayoutStatsCardsProps {
  stats: AdminPayoutStats;
  onFilterStatus?: (status: string) => void;
}

export function PayoutStatsCards({ stats, onFilterStatus }: PayoutStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <button
        type="button"
        className="text-left transition hover:opacity-90"
        onClick={() => onFilterStatus?.("pending")}
      >
        <AdminStatCard
          label="Pending Requests"
          value={`${stats.totalPendingCount} · ${formatBDT(stats.totalPendingAmount)}`}
          icon={Clock}
          accent="pink"
        />
      </button>
      <button type="button" className="text-left" onClick={() => onFilterStatus?.("approved")}>
        <AdminStatCard
          label="Approved (awaiting payment)"
          value={`${stats.totalApprovedCount} · ${formatBDT(stats.totalApprovedAmount)}`}
          icon={CheckCircle}
          accent="blue"
        />
      </button>
      <AdminStatCard
        label="Total Paid This Month"
        value={formatBDT(stats.totalPaidThisMonth)}
        icon={Wallet}
        accent="green"
      />
      <AdminStatCard
        label="Platform Fees Collected"
        value={formatBDT(stats.totalPlatformFeesCollected)}
        icon={TrendingUp}
        accent="purple"
      />
    </div>
  );
}
