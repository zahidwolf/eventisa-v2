"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GatewayForm } from "@/components/admin/payments/GatewayForm";
import {
  createPaymentGateway,
  deletePaymentGateway,
  fetchPaymentGateways,
  setDefaultPaymentGateway,
  updatePaymentGateway,
  type PaymentGateway,
} from "@/services/admin/payment-gateways.service";
import { getApiErrorMessage } from "@/services/api/client";

const PROVIDER_LABEL: Record<string, string> = {
  sslcommerz: "SSLCommerz",
  bkash: "bKash",
  nagad: "Nagad",
};

export function GatewayList() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | PaymentGateway | null>(null);

  const { data: gateways = [], isLoading } = useQuery({
    queryKey: ["admin-payment-gateways"],
    queryFn: fetchPaymentGateways,
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin-payment-gateways"] });

  const removeMut = useMutation({
    mutationFn: deletePaymentGateway,
    onSuccess: () => { toast.success("Gateway deleted"); invalidate(); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const defaultMut = useMutation({
    mutationFn: setDefaultPaymentGateway,
    onSuccess: () => { toast.success("Default gateway updated"); invalidate(); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading gateways…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={() => setModal("create")}>
          Add New Gateway
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gateways.map((gw) => (
          <div key={gw._id} className="glass-panel rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9B5CFF]/20">
                <CreditCard className="h-5 w-5 text-[#9B5CFF]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{gw.name}</p>
                <p className="text-sm text-zinc-400">{gw.displayName}</p>
                <p className="mt-1 text-xs text-zinc-500">{PROVIDER_LABEL[gw.provider] ?? gw.provider}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {gw.isDefault && (
                    <span className="rounded-full bg-[#9B5CFF]/20 px-2 py-0.5 text-[10px] text-[#9B5CFF]">Default</span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${gw.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-500/20 text-zinc-400"}`}>
                    {gw.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-white/15" onClick={() => setModal(gw)}>
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
              {!gw.isDefault && (
                <Button size="sm" variant="outline" className="border-white/15" onClick={() => defaultMut.mutate(gw._id)}>
                  <Star className="mr-1 h-3 w-3" /> Set as Default
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-300" onClick={() => removeMut.mutate(gw._id)}>
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0e1a] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {modal === "create" ? "Add payment gateway" : "Edit gateway"}
            </h2>
            <GatewayForm
              initial={modal === "create" ? undefined : modal}
              onCancel={() => setModal(null)}
              onSubmit={async (payload) => {
                try {
                  if (modal === "create") {
                    await createPaymentGateway(payload);
                    toast.success("Gateway created");
                  } else {
                    await updatePaymentGateway(modal._id, payload);
                    toast.success("Gateway updated");
                  }
                  setModal(null);
                  invalidate();
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
