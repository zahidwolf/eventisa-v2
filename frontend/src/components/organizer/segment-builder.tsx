"use client";

import { useState } from "react";
import { ChevronDown, Plus, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicFormBuilder } from "@/components/organizer/dynamic-form-builder";
import type { TicketSegment } from "@/lib/forms/form-field-types";

const defaultSegment = (): TicketSegment => ({
  title: "General",
  price: 0,
  isFree: true,
  capacity: 100,
  quantitySold: 0,
  maxPurchase: 10,
  minPurchase: 1,
  benefits: [],
  isVisible: true,
  status: "active",
  formEnabled: false,
  formFields: [],
});

interface SegmentBuilderProps {
  segments: TicketSegment[];
  onChange: (segments: TicketSegment[]) => void;
}

export function SegmentBuilder({ segments, onChange }: SegmentBuilderProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const update = (index: number, patch: Partial<TicketSegment>) => {
    const next = [...segments];
    const seg = { ...next[index], ...patch };
    if (patch.isFree || (patch.price === 0 && patch.price !== undefined)) {
      seg.isFree = true;
      seg.price = 0;
    }
    if (patch.price != null && patch.price > 0) seg.isFree = false;
    next[index] = seg;
    onChange(next);
  };

  const add = () => {
    onChange([...segments, defaultSegment()]);
    setExpanded(segments.length);
  };

  const remove = (index: number) => onChange(segments.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Create unlimited ticket segments. Each segment can have its own registration form.
      </p>
      {segments.map((seg, index) => {
        const open = expanded === index;
        return (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#12121e] to-[#070B1A]"
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => setExpanded(open ? null : index)}
            >
              <Ticket className="h-5 w-5 text-accent-magenta" />
              <div className="flex-1">
                <p className="font-semibold">{seg.title || "Untitled segment"}</p>
                <p className="text-xs text-zinc-500">
                  {seg.isFree ? "Free" : `৳${seg.price}`} · {seg.capacity} cap ·{" "}
                  {seg.formFields.length ? `${seg.formFields.length} form fields` : "No custom form"}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="space-y-4 border-t border-white/10 px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Segment name</Label>
                    <Input value={seg.title} onChange={(e) => update(index, { title: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <select
                      className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
                      value={seg.status ?? "active"}
                      onChange={(e) => update(index, { status: e.target.value as TicketSegment["status"] })}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                      <option value="soldout">Sold out</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={seg.description ?? ""}
                      onChange={(e) => update(index, { description: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={seg.isFree}
                      onChange={(e) => update(index, { isFree: e.target.checked, price: e.target.checked ? 0 : seg.price })}
                    />
                    Free ticket (no payment)
                  </label>
                  {!seg.isFree && (
                    <div className="space-y-1">
                      <Label>Price (৳)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={seg.price}
                        onChange={(e) => update(index, { price: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={seg.capacity}
                      onChange={(e) => update(index, { capacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Max per order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={seg.maxPurchase}
                      onChange={(e) => update(index, { maxPurchase: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Min per order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={seg.minPurchase ?? 1}
                      onChange={(e) => update(index, { minPurchase: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ticket color</Label>
                    <Input
                      placeholder="#FF3EA5"
                      value={seg.ticketColor ?? ""}
                      onChange={(e) => update(index, { ticketColor: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={seg.isVisible}
                      onChange={(e) => update(index, { isVisible: e.target.checked })}
                    />
                    Visible on event page
                  </label>
                </div>
                <div className="rounded-lg border border-dashed border-accent-magenta/30 p-4">
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={seg.formEnabled}
                      onChange={(e) => update(index, { formEnabled: e.target.checked })}
                    />
                    Segment-specific registration form
                  </label>
                  {seg.formEnabled && (
                    <DynamicFormBuilder
                      compact
                      fields={seg.formFields}
                      onChange={(formFields) => update(index, { formFields })}
                    />
                  )}
                </div>
                {segments.length > 1 && (
                  <Button type="button" variant="ghost" className="text-red-400" onClick={() => remove(index)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove segment
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={add} className="w-full border-white/15">
        <Plus className="mr-2 h-4 w-4" />
        Add ticket segment
      </Button>
    </div>
  );
}
