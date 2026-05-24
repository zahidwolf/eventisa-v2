"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromoCode, PromoCodeFormData, SegmentOption } from "@/types/promoCode.types";

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 16);
}

const defaultForm = (): PromoCodeFormData => {
  const from = new Date();
  const until = new Date();
  until.setMonth(until.getMonth() + 1);
  return {
    code: "",
    type: "percentage",
    value: 10,
    maxUses: 0,
    perUserLimit: 1,
    validFrom: toDateInput(from),
    validUntil: toDateInput(until),
    segmentIds: [],
    isActive: true,
  };
};

interface PromoCodeFormProps {
  segments: SegmentOption[];
  initial?: PromoCode | null;
  saving?: boolean;
  onSubmit: (data: PromoCodeFormData) => void;
  onCancel: () => void;
}

export function PromoCodeForm({
  segments,
  initial,
  saving,
  onSubmit,
  onCancel,
}: PromoCodeFormProps) {
  const [form, setForm] = useState<PromoCodeFormData>(defaultForm);
  const [unlimited, setUnlimited] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) {
      setForm(defaultForm());
      setUnlimited(true);
      return;
    }
    setForm({
      code: initial.code,
      type: initial.type,
      value: initial.value,
      maxUses: initial.maxUses,
      perUserLimit: initial.perUserLimit,
      validFrom: initial.validFrom.slice(0, 16),
      validUntil: initial.validUntil.slice(0, 16),
      segmentIds: initial.segmentIds ?? [],
      isActive: initial.isActive,
    });
    setUnlimited(initial.maxUses === 0);
  }, [initial]);

  const handleGenerate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, code }));
  };

  const toggleSegment = (id: string) => {
    setForm((f) => {
      const has = f.segmentIds.includes(id);
      return {
        ...f,
        segmentIds: has ? f.segmentIds.filter((s) => s !== id) : [...f.segmentIds, id],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.type === "percentage" && (form.value < 1 || form.value > 100)) {
      setError("Percentage must be between 1 and 100");
      return;
    }
    if (form.type === "flat" && form.value <= 0) {
      setError("Flat amount must be greater than 0");
      return;
    }
    if (new Date(form.validFrom) >= new Date(form.validUntil)) {
      setError("Start date must be before end date");
      return;
    }
    onSubmit({
      ...form,
      code: form.code?.trim() || undefined,
      maxUses: unlimited ? 0 : form.maxUses,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-2">
        <Label>Code</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Auto-generate if empty"
            value={form.code ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            disabled={!!initial}
          />
          {!initial && (
            <Button type="button" variant="secondary" onClick={handleGenerate}>
              Auto Generate
            </Button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {(["percentage", "flat"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={form.type === t ? "default" : "ghost"}
            size="sm"
            onClick={() => setForm((f) => ({ ...f, type: t }))}
          >
            {t === "percentage" ? "Percentage" : "Flat Amount"}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <Label>{form.type === "percentage" ? "Discount %" : "Flat amount (৳)"}</Label>
        <Input
          type="number"
          min={form.type === "percentage" ? 1 : 0.01}
          max={form.type === "percentage" ? 100 : undefined}
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
        Unlimited uses
      </label>
      {!unlimited && (
        <div className="space-y-2">
          <Label>Max uses</Label>
          <Input
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Per-user limit</Label>
        <Input
          type="number"
          min={1}
          value={form.perUserLimit}
          onChange={(e) => setForm((f) => ({ ...f, perUserLimit: Number(e.target.value) }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Valid from</Label>
          <Input
            type="datetime-local"
            value={form.validFrom}
            onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Valid until</Label>
          <Input
            type="datetime-local"
            value={form.validUntil}
            onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Segments</Label>
        <p className="text-xs text-zinc-500">Leave all unchecked for all segments</p>
        <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
          {segments.map((s) => (
            <label key={s.segmentId} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.segmentIds.includes(s.segmentId)}
                onChange={() => toggleSegment(s.segmentId)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {initial ? "Update code" : "Create code"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
