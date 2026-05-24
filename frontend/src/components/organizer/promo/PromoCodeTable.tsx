"use client";

import { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PromoCode, PromoCodeStatus, SegmentOption } from "@/types/promoCode.types";

const STATUS_STYLES: Record<PromoCodeStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-300",
  expired: "bg-zinc-500/20 text-zinc-400",
  exhausted: "bg-red-500/20 text-red-300",
  inactive: "bg-amber-500/20 text-amber-300",
};

function resolveStatus(code: PromoCode): PromoCodeStatus {
  if (code.status) return code.status;
  if (!code.isActive) return "inactive";
  if (new Date(code.validUntil) < new Date()) return "expired";
  if (code.maxUses > 0 && code.usedCount >= code.maxUses) return "exhausted";
  return "active";
}

function discountLabel(code: PromoCode) {
  return code.type === "percentage" ? `${code.value}%` : `৳${code.value}`;
}

interface PromoCodeTableProps {
  codes: PromoCode[];
  segments: SegmentOption[];
  onEdit: (code: PromoCode) => void;
  onDelete: (codeId: string) => void;
}

export function PromoCodeTable({ codes, segments, onEdit, onDelete }: PromoCodeTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const segmentName = (id: string) => segments.find((s) => s.segmentId === id)?.name ?? id;

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  };

  if (!codes.length) {
    return (
      <p className="rounded-lg border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">
        No promo codes yet
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-500">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2">Uses</th>
              <th className="px-3 py-2">Valid until</th>
              <th className="px-3 py-2">Segments</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const status = resolveStatus(c);
              const segLabel =
                !c.segmentIds?.length
                  ? "All"
                  : c.segmentIds.map(segmentName).join(", ");
              return (
                <tr key={c._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono font-medium">{c.code}</td>
                  <td className="px-3 py-2 capitalize">{c.type}</td>
                  <td className="px-3 py-2">{discountLabel(c)}</td>
                  <td className="px-3 py-2">
                    {c.usedCount}
                    {c.maxUses > 0 ? ` / ${c.maxUses}` : " / ∞"}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">
                    {new Date(c.validUntil).toLocaleDateString()}
                  </td>
                  <td className="max-w-[120px] truncate px-3 py-2 text-zinc-400" title={segLabel}>
                    {segLabel}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" onClick={() => copyCode(c.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => onEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => setConfirmId(c._id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete promo code?</DialogTitle>
            <p className="text-sm text-zinc-500">
              This cannot be undone. Codes with prior uses are still deleted.
            </p>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmId) onDelete(confirmId);
                setConfirmId(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
