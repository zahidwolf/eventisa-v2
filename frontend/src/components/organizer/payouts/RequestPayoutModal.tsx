"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBDT } from "@/lib/formatCurrency";
import { routes } from "@/config/routes";
import { createPayoutRequest } from "@/services/organizer/payout.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { BankingSnapshot, PayoutableEvent } from "@/types/payout.types";
import { formatBankingLabel } from "@/components/organizer/payouts/payout-utils";

interface RequestPayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: PayoutableEvent[];
  selectedIds: string[];
  bankingSnapshot?: BankingSnapshot;
  onSuccess: () => void;
}

export function RequestPayoutModal({
  open,
  onOpenChange,
  events,
  selectedIds,
  bankingSnapshot,
  onSuccess,
}: RequestPayoutModalProps) {
  const [note, setNote] = useState("");
  const selected = events.filter((e) => selectedIds.includes(e.eventId));
  const gross = selected.reduce((s, e) => s + e.grossRevenue, 0);
  const fee = selected.reduce((s, e) => s + e.platformFee, 0);
  const net = selected.reduce((s, e) => s + e.netRevenue, 0);

  const mutation = useMutation({
    mutationFn: () => createPayoutRequest(selectedIds, note.trim() || undefined),
    onSuccess: () => {
      toast.success("Payout request submitted! Admin will review within 3–5 business days.");
      onOpenChange(false);
      setNote("");
      onSuccess();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request payout</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>Events included: {selected.length}</p>
          <p className="text-zinc-400">Total amount: {formatBDT(gross)}</p>
          <p className="text-zinc-500">Platform fee: -{formatBDT(fee)}</p>
          <p className="text-lg font-bold">You receive: {formatBDT(net)}</p>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-zinc-500">Payout to</p>
            <p className="mt-1 font-medium">
              {bankingSnapshot ? formatBankingLabel(bankingSnapshot) : "Banking on file"}
            </p>
            <Link href={routes.organizer.settings} className="mt-2 inline-block text-xs text-[#FF3EA5] underline">
              Edit banking details
            </Link>
          </div>
          <textarea
            placeholder="Any note for admin (optional)"
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
            disabled={!selectedIds.length || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
