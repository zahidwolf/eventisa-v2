"use client";

import { Eye, Check, X, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/formatCurrency";
import type { PayoutRecord } from "@/types/payout.types";
import { payoutStatusClass, payoutStatusLabel } from "@/components/organizer/payouts/payout-utils";

interface AdminPayoutTableProps {
  items: PayoutRecord[];
  onView: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
}

export function AdminPayoutTable({
  items,
  onView,
  onApprove,
  onReject,
  onMarkPaid,
}: AdminPayoutTableProps) {
  if (!items.length) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-10 text-center text-zinc-500">
        No payout requests match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">Organizer</th>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Events</th>
            <th className="px-4 py-3">Gross</th>
            <th className="px-4 py-3">Fee</th>
            <th className="px-4 py-3">Net</th>
            <th className="px-4 py-3">Requested</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-medium text-white">{p.organizerName}</td>
              <td className="px-4 py-3 text-zinc-400">{p.organizationName || "—"}</td>
              <td className="px-4 py-3 text-zinc-400">{p.eventTitles?.length ?? 0}</td>
              <td className="px-4 py-3 text-zinc-300">{formatBDT(p.grossAmount)}</td>
              <td className="px-4 py-3 text-zinc-500">-{formatBDT(p.platformFee)}</td>
              <td className="px-4 py-3 text-white">{formatBDT(p.netAmount)}</td>
              <td className="px-4 py-3 text-zinc-500">
                {new Date(p.requestedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${payoutStatusClass(p.status)}`}
                >
                  {payoutStatusLabel(p.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(p._id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {p.status === "pending" && onApprove && (
                    <Button variant="ghost" size="sm" onClick={() => onApprove(p._id)}>
                      <Check className="h-4 w-4 text-emerald-400" />
                    </Button>
                  )}
                  {p.status === "pending" && onReject && (
                    <Button variant="ghost" size="sm" onClick={() => onReject(p._id)}>
                      <X className="h-4 w-4 text-red-400" />
                    </Button>
                  )}
                  {p.status === "approved" && onMarkPaid && (
                    <Button variant="ghost" size="sm" onClick={() => onMarkPaid(p._id)}>
                      <Banknote className="h-4 w-4 text-blue-400" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
