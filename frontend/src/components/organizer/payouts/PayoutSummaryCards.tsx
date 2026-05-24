"use client";

import Link from "next/link";
import { Wallet, Banknote, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/formatCurrency";
import { routes } from "@/config/routes";
import type { PayoutSummary } from "@/types/payout.types";

interface PayoutSummaryCardsProps {
  summary: PayoutSummary;
  bankingConfigured: boolean;
  bankingVerified: boolean;
  onRequestPayout: () => void;
}

export function PayoutSummaryCards({
  summary,
  bankingConfigured,
  bankingVerified,
  onRequestPayout,
}: PayoutSummaryCardsProps) {
  const canRequest = bankingConfigured && summary.availableForPayout > 0;

  return (
    <div className="space-y-4">
      {!bankingConfigured && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium">Please add your banking details before requesting a payout.</p>
          <Button asChild size="sm" variant="outline" className="mt-2 border-amber-500/40">
            <Link href={routes.organizer.settings}>Add Banking Details</Link>
          </Button>
        </div>
      )}
      {bankingConfigured && !bankingVerified && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          Your banking details are pending verification. You can still request a payout — admin will
          verify before processing.
        </div>
      )}
      {bankingConfigured && bankingVerified && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Banking details verified
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Earned (net)" value={formatBDT(summary.totalNetEarned)} icon={Wallet} />
        <StatCard label="Total Paid Out" value={formatBDT(summary.totalPaidOut)} icon={Banknote} />
        <StatCard label="Pending payout" value={formatBDT(summary.pendingPayout)} icon={Clock} />
        <div className="glass-panel rounded-2xl border border-[#FF3EA5]/30 bg-[#FF3EA5]/5 p-5 sm:col-span-2 lg:col-span-1 lg:row-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Available for Payout</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#FF3EA5]">
            {formatBDT(summary.availableForPayout)}
          </p>
          {summary.availableForPayout > 0 ? (
            <Button
              className="mt-4 w-full bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
              disabled={!canRequest}
              onClick={onRequestPayout}
            >
              Request Payout
            </Button>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No earnings available yet</p>
          )}
          {!bankingConfigured && summary.availableForPayout > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              <Link href={routes.organizer.settings} className="text-[#FF3EA5] underline">
                Set up banking details first
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF3EA5]/10 text-[#FF3EA5]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
