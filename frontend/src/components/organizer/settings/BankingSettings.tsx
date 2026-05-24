"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patchOrganizerBanking, type OrganizerSettings } from "@/services/organizer/settings.service";
import { getApiErrorMessage } from "@/services/api/client";

function MaskedInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-white/10 bg-white/5 pr-10"
        />
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShow((s) => !s)}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function BankingSettings({
  settings,
  onSaved,
}: {
  settings: OrganizerSettings;
  onSaved: (s: OrganizerSettings) => void;
}) {
  const b = settings.banking;
  const [form, setForm] = useState({
    accountHolderName: String(b.accountName ?? ""),
    bankName: String(b.bankName ?? ""),
    accountNumber: "",
    branchName: String(b.branchName ?? ""),
    routingNumber: "",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    preferredPayoutMethod: String(b.preferredMethod ?? "bank_transfer"),
  });
  const [loading, setLoading] = useState(false);
  const verified = !!b.bankingVerified;

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      const payload: Record<string, string> = { ...form };
      if (!payload.accountNumber) delete payload.accountNumber;
      if (!payload.bkashNumber) delete payload.bkashNumber;
      if (!payload.nagadNumber) delete payload.nagadNumber;
      if (!payload.rocketNumber) delete payload.rocketNumber;
      const data = await patchOrganizerBanking(payload);
      onSaved(data);
      toast.success("Banking details saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${verified ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
        {verified ? "✅ Banking details verified" : "⚠️ Pending verification by admin"}
      </div>
      <p className="text-sm text-zinc-500">
        Your banking details are only visible to Eventisa admins and used for payout processing only.
      </p>

      <div>
        <h3 className="mb-4 font-semibold text-white">Bank account</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Account holder name</Label>
            <Input value={form.accountHolderName} onChange={(e) => set("accountHolderName", e.target.value)} className="border-white/10 bg-white/5" />
          </div>
          <div className="space-y-1.5">
            <Label>Bank name</Label>
            <Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className="border-white/10 bg-white/5" />
          </div>
          <MaskedInput
            label="Account number"
            value={form.accountNumber}
            onChange={(v) => set("accountNumber", v)}
            placeholder={b.accountNumber ? `Current: ${b.accountNumber}` : undefined}
          />
          <div className="space-y-1.5">
            <Label>Branch name</Label>
            <Input value={form.branchName} onChange={(e) => set("branchName", e.target.value)} className="border-white/10 bg-white/5" />
          </div>
          <div className="space-y-1.5">
            <Label>Routing number (optional)</Label>
            <Input value={form.routingNumber} onChange={(e) => set("routingNumber", e.target.value)} className="border-white/10 bg-white/5" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-white">Mobile banking</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <MaskedInput label="bKash number" value={form.bkashNumber} onChange={(v) => set("bkashNumber", v)} placeholder={b.bkashNumber ? `Current: ${b.bkashNumber}` : undefined} />
          <MaskedInput label="Nagad number" value={form.nagadNumber} onChange={(v) => set("nagadNumber", v)} placeholder={b.nagadNumber ? `Current: ${b.nagadNumber}` : undefined} />
          <MaskedInput label="Rocket number" value={form.rocketNumber} onChange={(v) => set("rocketNumber", v)} placeholder={b.rocketNumber ? `Current: ${b.rocketNumber}` : undefined} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Preferred payout method</Label>
        <select value={form.preferredPayoutMethod} onChange={(e) => set("preferredPayoutMethod", e.target.value)} className="min-h-11 w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 text-sm">
          <option value="bank_transfer">Bank Transfer</option>
          <option value="bkash">bKash</option>
          <option value="nagad">Nagad</option>
          <option value="rocket">Rocket</option>
        </select>
      </div>

      <Button onClick={() => void save()} disabled={loading} className="bg-accent-magenta hover:bg-accent-magenta/90">
        Save banking details
      </Button>
    </div>
  );
}
