"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/formatCurrency";
import type { AdminPayoutDetail } from "@/types/payout.types";
import { payoutStatusClass, payoutStatusLabel } from "@/components/organizer/payouts/payout-utils";

interface AdminPayoutDrawerProps {
  detail: AdminPayoutDetail | null;
  loading?: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkPaid?: () => void;
  actionLoading?: boolean;
}

export function AdminPayoutDrawer({
  detail,
  loading,
  onClose,
  onApprove,
  onReject,
  onMarkPaid,
  actionLoading,
}: AdminPayoutDrawerProps) {
  if (!detail && !loading) return null;

  const payout = detail?.payout;
  const snap = payout?.bankingSnapshot;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-white">Payout request</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {loading && <p className="text-zinc-500">Loading…</p>}
          {payout && (
            <div className="space-y-5">
              <div>
                <p className="font-medium text-white">{payout.organizerName}</p>
                <p className="text-zinc-400">{payout.organizationName}</p>
                {detail.organizerEmail && (
                  <p className="text-zinc-500">{detail.organizerEmail}</p>
                )}
                <span
                  className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs ${payoutStatusClass(payout.status)}`}
                >
                  {payoutStatusLabel(payout.status)}
                </span>
              </div>

              {snap && (
                <section>
                  <h3 className="text-xs uppercase text-zinc-500">Banking (snapshot)</h3>
                  <div className="mt-2 rounded-lg border border-white/10 p-3 space-y-1 text-zinc-300">
                    <p>Method: {snap.preferredMethod ?? "—"}</p>
                    {snap.bankName && <p>Bank: {snap.bankName}</p>}
                    {snap.accountNumber && <p>Account: {snap.accountNumber}</p>}
                    {snap.accountName && <p>Name: {snap.accountName}</p>}
                    {snap.branchName && <p>Branch: {snap.branchName}</p>}
                    {snap.bkashNumber && <p>bKash: {snap.bkashNumber}</p>}
                    {snap.nagadNumber && <p>Nagad: {snap.nagadNumber}</p>}
                    {snap.rocketNumber && <p>Rocket: {snap.rocketNumber}</p>}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs uppercase text-zinc-500">Events</h3>
                <table className="mt-2 w-full text-xs">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="py-1 text-left">Title</th>
                      <th className="py-1 text-right">Gross</th>
                      <th className="py-1 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.eventBreakdown.map((e) => (
                      <tr key={e.eventId} className="border-t border-white/5">
                        <td className="py-2 pr-2 text-white">{e.title}</td>
                        <td className="py-2 text-right text-zinc-400">{formatBDT(e.gross)}</td>
                        <td className="py-2 text-right text-white">{formatBDT(e.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="rounded-lg border border-white/10 p-3 space-y-1">
                <Row label="Gross revenue" value={formatBDT(payout.grossAmount)} />
                <Row label="Platform fee" value={`-${formatBDT(payout.platformFee)}`} />
                <Row label="Net payout" value={formatBDT(payout.netAmount)} bold />
              </section>

              {payout.requestNote && (
                <p className="text-zinc-400">
                  <span className="text-zinc-500">Organizer note: </span>
                  {payout.requestNote}
                </p>
              )}

              <div className="text-xs text-zinc-500 space-y-1">
                <p>Requested: {new Date(payout.requestedAt).toLocaleString()}</p>
                {payout.reviewedAt && (
                  <p>
                    Reviewed: {new Date(payout.reviewedAt).toLocaleString()}
                    {payout.reviewedByName ? ` by ${payout.reviewedByName}` : ""}
                  </p>
                )}
                {payout.paidAt && <p>Paid: {new Date(payout.paidAt).toLocaleString()}</p>}
              </div>

              {payout.status === "paid" && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
                  <p>Ref: {payout.txRef}</p>
                  <p>Method: {payout.paymentMethod}</p>
                  {payout.paymentNote && <p>Note: {payout.paymentNote}</p>}
                </div>
              )}

              {payout.rejectionReason && (
                <p className="text-red-400">Rejected: {payout.rejectionReason}</p>
              )}
            </div>
          )}
        </div>
        {payout && (
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
            {payout.status === "pending" && (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-600/90"
                  disabled={actionLoading}
                  onClick={onApprove}
                >
                  Approve
                </Button>
                <Button variant="destructive" disabled={actionLoading} onClick={onReject}>
                  Reject
                </Button>
              </>
            )}
            {payout.status === "approved" && (
              <Button className="bg-[#4F8CFF]" disabled={actionLoading} onClick={onMarkPaid}>
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={bold ? "font-bold text-white" : "text-zinc-300"}>{value}</span>
    </div>
  );
}
