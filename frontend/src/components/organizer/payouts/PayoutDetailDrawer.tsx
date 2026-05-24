"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/formatCurrency";
import type { PayoutRecord } from "@/types/payout.types";
import { formatBankingLabel, payoutStatusClass, payoutStatusLabel } from "./payout-utils";

interface PayoutDetailDrawerProps {
  payout: PayoutRecord | null;
  onClose: () => void;
}

export function PayoutDetailDrawer({ payout, onClose }: PayoutDetailDrawerProps) {
  if (!payout) return null;

  const statusClass = payoutStatusClass(payout.status);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-white">Payout details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
              {payoutStatusLabel(payout.status)}
            </span>
            <span className="text-zinc-500">
              Requested {new Date(payout.requestedAt).toLocaleString()}
            </span>
          </div>

          <section>
            <h3 className="text-xs font-medium uppercase text-zinc-500">Events included</h3>
            <ul className="mt-2 space-y-1 text-white">
              {payout.eventTitles.map((t, i) => (
                <li key={`${payout._id}-${i}`}>• {t}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-white/10 p-3 space-y-1">
            <Row label="Gross" value={formatBDT(payout.grossAmount)} />
            <Row label="Platform fee" value={`-${formatBDT(payout.platformFee)}`} muted />
            <Row label="Net (you receive)" value={formatBDT(payout.netAmount)} bold />
          </section>

          {payout.bankingSnapshot && (
            <section>
              <h3 className="text-xs font-medium uppercase text-zinc-500">Banking details used</h3>
              <p className="mt-1 text-white">{formatBankingLabel(payout.bankingSnapshot)}</p>
              {payout.bankingSnapshot.accountName && (
                <p className="text-zinc-400">{payout.bankingSnapshot.accountName}</p>
              )}
            </section>
          )}

          {payout.requestNote && (
            <section>
              <h3 className="text-xs font-medium uppercase text-zinc-500">Your note</h3>
              <p className="mt-1 text-zinc-300">{payout.requestNote}</p>
            </section>
          )}

          {payout.rejectionReason && (
            <section className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <h3 className="text-xs font-medium text-red-400">Rejection reason</h3>
              <p className="mt-1 text-red-200">{payout.rejectionReason}</p>
            </section>
          )}

          {payout.status === "paid" && (
            <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
              <Row label="Transaction ref" value={payout.txRef ?? "—"} />
              <Row label="Payment method" value={payout.paymentMethod ?? "—"} />
              {payout.paidAt && (
                <Row label="Paid at" value={new Date(payout.paidAt).toLocaleString()} />
              )}
              {payout.paymentNote && <Row label="Admin note" value={payout.paymentNote} />}
            </section>
          )}

          {payout.reviewedAt && (
            <p className="text-xs text-zinc-500">
              Reviewed {new Date(payout.reviewedAt).toLocaleString()}
              {payout.reviewedByName ? ` by ${payout.reviewedByName}` : ""}
            </p>
          )}
        </div>
        <div className="border-t border-white/10 p-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </aside>
    </>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className={muted ? "text-zinc-500" : "text-zinc-400"}>{label}</span>
      <span className={bold ? "font-bold text-[#FF3EA5]" : "text-white"}>{value}</span>
    </div>
  );
}
