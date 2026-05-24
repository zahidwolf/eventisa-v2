"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FieldRow, SaveBar, TextInput } from "@/components/admin/settings/settings-form-parts";
import { patchFeeSettings } from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PlatformSettings } from "@/types/platform-settings";

export function FeeSettingsPanel({
  settings,
  readOnly,
  onSaved,
}: {
  settings: PlatformSettings;
  readOnly: boolean;
  onSaved: (s: PlatformSettings) => void;
}) {
  const [form, setForm] = useState(settings.fees);
  useEffect(() => setForm(settings.fees), [settings]);

  const preview = useMemo(() => {
    const ticket = 1000;
    const fee = Math.round(ticket * (form.serviceFeePercent / 100));
    return { ticket, fee, buyer: ticket + fee };
  }, [form.serviceFeePercent]);

  const save = useMutation({
    mutationFn: () => patchFeeSettings(form),
    onSuccess: (data) => {
      toast.success("Fee settings saved");
      onSaved(data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <FieldRow label="Service fee (%)" hint="Charged on top of ticket price. Buyer pays this.">
        <TextInput
          type="number"
          min={0}
          max={20}
          disabled={readOnly}
          value={form.serviceFeePercent}
          onChange={(e) => setForm({ ...form, serviceFeePercent: Number(e.target.value) })}
        />
      </FieldRow>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
        <p className="mb-3 font-medium text-white">On a ৳1,000 ticket:</p>
        <div className="space-y-1 text-zinc-400">
          <p>Ticket price: ৳{preview.ticket.toLocaleString()}</p>
          <p>
            Service fee ({form.serviceFeePercent}%): ৳{preview.fee.toLocaleString()}
          </p>
          <p className="text-white">Buyer pays: ৳{preview.buyer.toLocaleString()}</p>
          <p>Organizer gets: ৳{preview.ticket.toLocaleString()}</p>
          <p>Eventisa earns: ৳{preview.fee.toLocaleString()}</p>
        </div>
      </div>

      <FieldRow label="Minimum payout amount (BDT)">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.minimumPayoutAmount}
          onChange={(e) => setForm({ ...form, minimumPayoutAmount: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Payout processing days" hint="Working days after event ends">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.payoutProcessingDays}
          onChange={(e) => setForm({ ...form, payoutProcessingDays: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Auto-approve payouts under (BDT)" hint="0 = disabled">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.autoApprovePayoutsUnder}
          onChange={(e) => setForm({ ...form, autoApprovePayoutsUnder: Number(e.target.value) })}
        />
      </FieldRow>

      <SaveBar saving={save.isPending} readOnly={readOnly} onSave={() => save.mutate()} />
    </div>
  );
}
