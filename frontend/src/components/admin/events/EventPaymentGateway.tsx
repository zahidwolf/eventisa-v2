"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  assignEventGateway,
  fetchEventGatewayAssignment,
  fetchPaymentGateways,
  removeEventGateway,
} from "@/services/admin/payment-gateways.service";
import { getApiErrorMessage } from "@/services/api/client";

const PROVIDER_LABEL: Record<string, string> = {
  sslcommerz: "SSLCommerz",
  bkash: "bKash",
  nagad: "Nagad",
};

export function EventPaymentGateway({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const { data: assignment } = useQuery({
    queryKey: ["event-gateway-assignment", eventId],
    queryFn: () => fetchEventGatewayAssignment(eventId),
  });

  const { data: gateways = [] } = useQuery({
    queryKey: ["admin-payment-gateways"],
    queryFn: fetchPaymentGateways,
    enabled: open,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["event-gateway-assignment", eventId] });
  };

  const assignMut = useMutation({
    mutationFn: (gatewayId: string) => assignEventGateway(eventId, gatewayId),
    onSuccess: () => {
      toast.success("Gateway assigned");
      setOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const removeMut = useMutation({
    mutationFn: () => removeEventGateway(eventId),
    onSuccess: () => {
      toast.success("Using platform default gateway");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const current = assignment?.assigned ?? assignment?.effective;
  const label = assignment?.usesPlatformDefault
    ? `Platform default — ${assignment.effective?.displayName ?? "—"}`
    : `${assignment?.assigned?.displayName} (${PROVIDER_LABEL[assignment?.assigned?.provider ?? ""] ?? ""})`;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-2 text-white">
        <CreditCard className="h-5 w-5 text-[#9B5CFF]" />
        <h3 className="font-semibold">Payment Gateway</h3>
      </div>
      <p className="mt-3 text-sm text-zinc-400">
        <span className="text-zinc-500">Current: </span>
        {label}
      </p>
      {assignment?.assignedBy && assignment.assignedAt && (
        <p className="mt-1 text-xs text-zinc-500">
          Assigned by {assignment.assignedBy.name ?? assignment.assignedBy.email} on{" "}
          {new Date(assignment.assignedAt).toLocaleString()}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={() => setOpen(true)}>
          Assign Gateway
        </Button>
        {assignment?.assigned && (
          <Button size="sm" variant="outline" className="border-white/15" onClick={() => removeMut.mutate()} disabled={removeMut.isPending}>
            Use Default
          </Button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0e1a] p-6">
            <h4 className="text-lg font-semibold text-white">Select gateway for this event</h4>
            <div className="mt-4 space-y-2">
              {gateways.filter((g) => g.isActive).map((g) => (
                <label key={g._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 p-3 hover:bg-white/5">
                  <input
                    type="radio"
                    name="gateway"
                    value={g._id}
                    checked={selected === g._id}
                    onChange={() => setSelected(g._id)}
                  />
                  <span className="text-sm text-white">
                    {g.displayName} ({PROVIDER_LABEL[g.provider]})
                    {g.isDefault && <span className="ml-2 text-xs text-[#9B5CFF]">Default</span>}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="border-white/15" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
                disabled={!selected || assignMut.isPending}
                onClick={() => assignMut.mutate(selected)}
              >
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
