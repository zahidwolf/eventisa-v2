"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/admin/payments/PasswordField";
import type { GatewayProvider, PaymentGateway } from "@/services/admin/payment-gateways.service";

const PROVIDERS: { id: GatewayProvider; label: string }[] = [
  { id: "sslcommerz", label: "SSLCommerz" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
];

interface GatewayFormProps {
  initial?: PaymentGateway;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function GatewayForm({ initial, onSubmit, onCancel }: GatewayFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [provider, setProvider] = useState<GatewayProvider>(initial?.provider ?? "sslcommerz");
  const [logo, setLogo] = useState(initial?.logo ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const c = (initial?.credentials ?? {}) as Record<string, string | boolean>;

  const [storeId, setStoreId] = useState(String(c.storeId ?? ""));
  const [storePass, setStorePass] = useState(String(c.storePass ?? ""));
  const [sslSandbox, setSslSandbox] = useState(!!c.sandbox);
  const [appKey, setAppKey] = useState(String(c.appKey ?? ""));
  const [appSecret, setAppSecret] = useState(String(c.appSecret ?? ""));
  const [username, setUsername] = useState(String(c.username ?? ""));
  const [password, setPassword] = useState(String(c.password ?? ""));
  const [bkashSandbox, setBkashSandbox] = useState(!!c.sandbox);
  const [merchantId, setMerchantId] = useState(String(c.merchantId ?? ""));
  const [merchantNumber, setMerchantNumber] = useState(String(c.merchantNumber ?? ""));
  const [pubKey, setPubKey] = useState(String(c.pubKey ?? ""));
  const [privKey, setPrivKey] = useState(String(c.privKey ?? ""));
  const [nagadSandbox, setNagadSandbox] = useState(!!c.sandbox);

  const buildCredentials = (): Record<string, unknown> => {
    if (provider === "bkash") {
      return { appKey, appSecret, username, password, sandbox: bkashSandbox };
    }
    if (provider === "nagad") {
      return { merchantId, merchantNumber, pubKey, privKey, sandbox: nagadSandbox };
    }
    return { storeId, storePass, sandbox: sslSandbox };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        displayName,
        provider,
        logo: logo || undefined,
        isDefault,
        isActive,
        credentials: buildCredentials(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-zinc-400">Internal name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="border-white/10 bg-white/5" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-400">Display name</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="border-white/10 bg-white/5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-400">Provider</Label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as GatewayProvider)}
          className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm"
          disabled={!!initial}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-400">Logo URL (optional)</Label>
        <Input value={logo} onChange={(e) => setLogo(e.target.value)} className="border-white/10 bg-white/5" />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 text-zinc-300">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          Set as platform default
        </label>
        <label className="flex items-center gap-2 text-zinc-300">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Credentials</p>
        {provider === "sslcommerz" && (
          <>
            <PasswordField id="storeId" label="Store ID" value={storeId} onChange={setStoreId} required />
            <PasswordField id="storePass" label="Store Password" value={storePass} onChange={setStorePass} required />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" checked={sslSandbox} onChange={(e) => setSslSandbox(e.target.checked)} />
              Sandbox / Test mode
            </label>
          </>
        )}
        {provider === "bkash" && (
          <>
            <PasswordField id="appKey" label="App Key" value={appKey} onChange={setAppKey} required />
            <PasswordField id="appSecret" label="App Secret" value={appSecret} onChange={setAppSecret} required />
            <PasswordField id="username" label="Username" value={username} onChange={setUsername} required />
            <PasswordField id="password" label="Password" value={password} onChange={setPassword} required />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" checked={bkashSandbox} onChange={(e) => setBkashSandbox(e.target.checked)} />
              Sandbox / Test mode
            </label>
          </>
        )}
        {provider === "nagad" && (
          <>
            <PasswordField id="merchantId" label="Merchant ID" value={merchantId} onChange={setMerchantId} required />
            <PasswordField id="merchantNumber" label="Merchant Number" value={merchantNumber} onChange={setMerchantNumber} required />
            <PasswordField id="pubKey" label="Public Key" value={pubKey} onChange={setPubKey} required />
            <PasswordField id="privKey" label="Private Key" value={privKey} onChange={setPrivKey} required />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" checked={nagadSandbox} onChange={(e) => setNagadSandbox(e.target.checked)} />
              Sandbox / Test mode
            </label>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-white/15">Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90">
          {loading ? "Saving…" : initial ? "Update gateway" : "Add gateway"}
        </Button>
      </div>
    </form>
  );
}
