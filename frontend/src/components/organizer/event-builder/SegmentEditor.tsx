"use client";

import { FormBuilder } from "@/components/organizer/event-builder/FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SegmentStatus, SegmentVisibility, TicketSegment } from "@/types/eventBuilder.types";

interface SegmentEditorProps {
  segment: TicketSegment;
  onChange: (segment: TicketSegment) => void;
  onSave?: () => void;
  onDelete?: () => void;
}

export function SegmentEditor({ segment, onChange, onSave, onDelete }: SegmentEditorProps) {
  const patch = (p: Partial<TicketSegment>) => onChange({ ...segment, ...p });

  return (
    <div className="space-y-6 rounded-xl border border-white/10 bg-gradient-to-br from-[#12121e] to-[#070B1A] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Edit segment</h3>
        <div className="flex gap-2">
          {onDelete && (
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
          {onSave && (
            <Button type="button" size="sm" className="bg-accent-magenta" onClick={onSave}>
              Save segment
            </Button>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-400">Basic</h4>
        <div>
          <Label>Name</Label>
          <Input value={segment.name} onChange={(e) => patch({ name: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={segment.description ?? ""} onChange={(e) => patch({ description: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
        </div>
        <div>
          <Label>Ticket color</Label>
          <input type="color" value={segment.ticketColor ?? "#9B5CFF"} onChange={(e) => patch({ ticketColor: e.target.value })} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-white/10" />
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-400">Pricing</h4>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={segment.isFree}
            onChange={(e) => patch({ isFree: e.target.checked, price: e.target.checked ? 0 : segment.price })}
          />
          Free ticket
        </label>
        {!segment.isFree && (
          <div>
            <Label>Price (৳)</Label>
            <Input type="number" min={0} value={segment.price} onChange={(e) => patch({ price: Number(e.target.value) })} className="mt-1 border-white/10 bg-white/5" />
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <h4 className="col-span-full text-sm font-medium text-zinc-400">Capacity</h4>
        <div>
          <Label>Capacity</Label>
          <Input type="number" min={1} value={segment.capacity} onChange={(e) => patch({ capacity: Number(e.target.value), remainingQuantity: Number(e.target.value) })} className="mt-1 border-white/10 bg-white/5" />
        </div>
        <div>
          <Label>Max per user</Label>
          <Input type="number" min={1} value={segment.maxPurchasePerUser} onChange={(e) => patch({ maxPurchasePerUser: Number(e.target.value) })} className="mt-1 border-white/10 bg-white/5" />
        </div>
        <div>
          <Label>Min purchase</Label>
          <Input type="number" min={1} value={segment.minPurchase} onChange={(e) => patch({ minPurchase: Number(e.target.value) })} className="mt-1 border-white/10 bg-white/5" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <h4 className="col-span-full text-sm font-medium text-zinc-400">Sale window</h4>
        <div>
          <Label>Sale start</Label>
          <Input type="datetime-local" value={segment.saleStart?.slice(0, 16) ?? ""} onChange={(e) => patch({ saleStart: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
        </div>
        <div>
          <Label>Sale end</Label>
          <Input type="datetime-local" value={segment.saleEnd?.slice(0, 16) ?? ""} onChange={(e) => patch({ saleEnd: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <h4 className="col-span-full text-sm font-medium text-zinc-400">Visibility & status</h4>
        <div>
          <Label>Visibility</Label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm"
            value={segment.visibility}
            onChange={(e) => patch({ visibility: e.target.value as SegmentVisibility })}
          >
            <option value="public">Public</option>
            <option value="hidden">Hidden</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>
        <div>
          <Label>Status</Label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm"
            value={segment.status}
            onChange={(e) => patch({ status: e.target.value as SegmentStatus })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="soldout">Sold out</option>
            <option value="hidden">Hidden</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-medium text-zinc-400">Form fields</h4>
        <FormBuilder
          segmentId={segment.segmentId}
          fields={segment.formFields}
          onChange={(formFields) => patch({ formFields })}
        />
      </section>
    </div>
  );
}
