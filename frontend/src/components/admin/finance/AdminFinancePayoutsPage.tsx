"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RejectModal } from "@/components/admin/events/RejectModal";
import { PayoutStatsCards } from "./PayoutStatsCards";
import { AdminPayoutTable } from "./AdminPayoutTable";
import { AdminPayoutDrawer } from "./AdminPayoutDrawer";
import { MarkPaidModal } from "./MarkPaidModal";
import {
  approvePayoutRequest,
  getAdminPayoutDetail,
  getAdminPayouts,
  getAdminPayoutStats,
  markPayoutAsPaid,
  rejectPayoutRequest,
} from "@/services/admin/payout.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PayoutStatus } from "@/types/payout.types";

type StatusFilter = PayoutStatus | "all";

export function AdminFinancePayoutsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [paidId, setPaidId] = useState<string | null>(null);

  const statsQ = useQuery({ queryKey: ["admin-payout-stats"], queryFn: getAdminPayoutStats });
  const listQ = useQuery({
    queryKey: ["admin-payouts", status, search, dateFrom, dateTo, page],
    queryFn: () =>
      getAdminPayouts({
        status: status === "all" ? undefined : status,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 20,
      }),
  });

  const detailQ = useQuery({
    queryKey: ["admin-payout-detail", drawerId],
    queryFn: () => getAdminPayoutDetail(drawerId!),
    enabled: !!drawerId,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-payout-stats"] });
    void qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    if (drawerId) void qc.invalidateQueries({ queryKey: ["admin-payout-detail", drawerId] });
  };

  const approveMut = useMutation({
    mutationFn: (id: string) => approvePayoutRequest(id),
    onSuccess: () => {
      toast.success("Payout approved");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectPayoutRequest(id, reason),
    onSuccess: () => {
      toast.success("Payout rejected");
      setRejectId(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const paidMut = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { txRef: string; paymentMethod: string; paymentNote?: string };
    }) => markPayoutAsPaid(id, body),
    onSuccess: () => {
      toast.success("Marked as paid");
      setPaidId(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const items = listQ.data?.items ?? [];
  const paidTarget = items.find((p) => p._id === paidId) ?? detailQ.data?.payout;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Payouts</h1>
        <p className="text-sm text-zinc-500">Review organizer payout requests and disbursements.</p>
      </div>

      {statsQ.data && (
        <PayoutStatsCards stats={statsQ.data} onFilterStatus={(s) => setStatus(s as StatusFilter)} />
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search organizer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-black/40 pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-auto border-white/10 bg-black/40"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-auto border-white/10 bg-black/40"
        />
        {(["all", "pending", "approved", "paid", "rejected"] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            className={status === s ? "bg-[#FF3EA5]" : "border-white/10"}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <AdminPayoutTable
        items={items}
        onView={setDrawerId}
        onApprove={(id) => approveMut.mutate(id)}
        onReject={setRejectId}
        onMarkPaid={setPaidId}
      />

      <AdminPayoutDrawer
        detail={detailQ.data ?? null}
        loading={detailQ.isLoading}
        onClose={() => setDrawerId(null)}
        onApprove={() => drawerId && approveMut.mutate(drawerId)}
        onReject={() => drawerId && setRejectId(drawerId)}
        onMarkPaid={() => drawerId && setPaidId(drawerId)}
        actionLoading={approveMut.isPending || rejectMut.isPending || paidMut.isPending}
      />

      <RejectModal
        open={!!rejectId}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject payout request"
        confirmLabel="Reject payout"
        loading={rejectMut.isPending}
        onConfirm={(reason) => rejectId && rejectMut.mutate({ id: rejectId, reason })}
      />

      {paidTarget && (
        <MarkPaidModal
          open={!!paidId}
          onOpenChange={(o) => !o && setPaidId(null)}
          organizerName={paidTarget.organizerName!}
          netAmount={paidTarget.netAmount}
          loading={paidMut.isPending}
          onConfirm={(body) => paidId && paidMut.mutate({ id: paidId, body })}
        />
      )}
    </div>
  );
}
