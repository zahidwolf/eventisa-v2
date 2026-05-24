"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/formatCurrency";
import { getPayouts, getPayoutDetail } from "@/services/organizer/payout.service";
import { PayoutDetailDrawer } from "./PayoutDetailDrawer";
import { payoutStatusClass, payoutStatusLabel } from "./payout-utils";
import type { PayoutStatus } from "@/types/payout.types";

interface PayoutHistoryTableProps {
  statusFilter: PayoutStatus | "all";
}

export function PayoutHistoryTable({ statusFilter }: PayoutHistoryTableProps) {
  const [page] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["organizer-payouts", statusFilter, page],
    queryFn: () =>
      getPayouts({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: 20,
      }),
  });

  const { data: detail } = useQuery({
    queryKey: ["organizer-payout-detail", detailId],
    queryFn: () => getPayoutDetail(detailId!),
    enabled: !!detailId,
  });

  const items = data?.items ?? [];

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading payout history…</p>;
  }

  if (!items.length) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-8 text-center text-zinc-500">
        No payout requests yet.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Request date</th>
              <th className="px-4 py-3">Events</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reviewed</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-zinc-300">
                  {new Date(p.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.eventTitles.length}</td>
                <td className="px-4 py-3 font-medium text-white">{formatBDT(p.netAmount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${payoutStatusClass(p.status)}`}
                  >
                    {payoutStatusLabel(p.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => setDetailId(p._id)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PayoutDetailDrawer payout={detail ?? null} onClose={() => setDetailId(null)} />
    </>
  );
}
