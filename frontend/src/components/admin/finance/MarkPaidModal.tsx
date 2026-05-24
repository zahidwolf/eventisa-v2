"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBDT } from "@/lib/formatCurrency";

const METHODS = ["bKash", "Nagad", "Bank Transfer", "Rocket"] as const;

interface MarkPaidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerName: string;
  netAmount: number;
  loading?: boolean;
  onConfirm: (body: { txRef: string; paymentMethod: string; paymentNote?: string }) => void;
}

export function MarkPaidModal({
  open,
  onOpenChange,
  organizerName,
  netAmount,
  loading,
  onConfirm,
}: MarkPaidModalProps) {
  const [txRef, setTxRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState("");

  const submit = () => {
    if (!txRef.trim() || !paymentMethod) return;
    onConfirm({
      txRef: txRef.trim(),
      paymentMethod,
      paymentNote: paymentNote.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as paid</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-zinc-400">
          Paying <strong className="text-white">{formatBDT(netAmount)}</strong> to {organizerName}
        </p>
        <div className="space-y-3">
          <div>
            <Label>Transaction reference</Label>
            <Input
              placeholder='e.g. "bKash TrxID: ABC123XYZ"'
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              className="mt-1 border-white/10 bg-black/40"
            />
          </div>
          <div>
            <Label>Payment method</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="">Select method</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Admin note (optional)</Label>
            <textarea
              value={paymentNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPaymentNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-600/90"
            disabled={loading || !txRef.trim() || !paymentMethod}
            onClick={submit}
          >
            Confirm payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
