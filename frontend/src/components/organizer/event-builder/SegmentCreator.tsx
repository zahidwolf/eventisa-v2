"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEGMENT_STATUS_CONFIG } from "@/components/organizer/event-builder/fieldConfig";
import { createDefaultSegment } from "@/components/organizer/event-builder/segmentDefaults";
import { FormBuilder } from "@/components/organizer/event-builder/FormBuilder";
import type { TicketSegment } from "@/types/eventBuilder.types";

interface SegmentCreatorProps {
  segments: TicketSegment[];
  onChange: (segments: TicketSegment[]) => void;
  onSetForm?: (segmentId: string) => void;
  segmentBookings?: Record<string, number>;
  /** Admins may remove segments even when tickets were sold. */
  allowForceDelete?: boolean;
}

type DraftSegment = Omit<TicketSegment, "segmentId"> & { segmentId?: string };

function emptyDraft(): DraftSegment {
  const base = createDefaultSegment(0);
  return { ...base, name: "", status: "draft" };
}

function SegmentListCard({
  segment,
  onEdit,
  onSetForm,
  onDelete,
  hasBookings,
  allowForceDelete,
}: {
  segment: TicketSegment;
  onEdit: () => void;
  onSetForm: () => void;
  onDelete: () => void;
  hasBookings: boolean;
  allowForceDelete?: boolean;
}) {
  const canDelete = allowForceDelete || !hasBookings;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: segment.segmentId,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const statusCfg = SEGMENT_STATUS_CONFIG[segment.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-white/10 bg-white/5 p-4"
    >
      <div className="flex items-start gap-2">
        <button type="button" className="mt-1 text-zinc-500" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: segment.ticketColor ?? "#9B5CFF" }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{segment.name}</p>
          <p className="text-sm text-zinc-400">
            {segment.isFree ? "Free" : `৳${segment.price.toLocaleString("en-BD")}`} ·{" "}
            {segment.capacity} capacity ·{" "}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onSetForm}>
          Set Form
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-400"
          disabled={!canDelete}
          title={!canDelete ? "Cannot delete — segment has bookings" : undefined}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
      {hasBookings && !allowForceDelete && (
        <p className="mt-2 text-xs text-amber-400">This segment has bookings and cannot be deleted.</p>
      )}
      {hasBookings && allowForceDelete && (
        <p className="mt-2 text-xs text-amber-400">Admin: deleting a segment with sold tickets may affect orders.</p>
      )}
    </div>
  );
}

function SegmentInlineForm({
  draft,
  onDraft,
  onSave,
  onCancel,
}: {
  draft: DraftSegment;
  onDraft: (d: DraftSegment) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-accent-purple/30 bg-gradient-to-br from-[#12121e] to-[#070B1A] p-5 space-y-4">
      <div className="space-y-2">
        <Label>Segment name</Label>
        <Input
          value={draft.name}
          onChange={(e) => onDraft({ ...draft, name: e.target.value })}
          placeholder="VIP, Regular, Student…"
          className="border-white/10 bg-white/5"
        />
        <p className="text-xs text-zinc-600">
          e.g. VIP, Regular, Student, Free Entry, Early Bird, Backstage, Fan Zone
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm text-zinc-400">Ticket type</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={!draft.isFree}
              onChange={() => onDraft({ ...draft, isFree: false })}
            />
            Paid
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={draft.isFree}
              onChange={() => onDraft({ ...draft, isFree: true, price: 0 })}
            />
            Free
          </label>
        </div>
      </fieldset>

      {!draft.isFree && (
        <div className="space-y-2">
          <Label>Price (BDT)</Label>
          <Input
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => onDraft({ ...draft, price: Number(e.target.value) })}
            className="border-white/10 bg-white/5"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Total capacity</Label>
          <Input
            type="number"
            min={1}
            value={draft.capacity}
            onChange={(e) => {
              const cap = Number(e.target.value);
              onDraft({ ...draft, capacity: cap, remainingQuantity: cap });
            }}
            className="border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label>Max per person</Label>
          <Input
            type="number"
            min={1}
            value={draft.maxPurchasePerUser}
            onChange={(e) => onDraft({ ...draft, maxPurchasePerUser: Number(e.target.value) || 10 })}
            className="border-white/10 bg-white/5"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Registration opens (optional)</Label>
          <Input
            type="datetime-local"
            value={draft.saleStart?.slice(0, 16) ?? ""}
            onChange={(e) =>
              onDraft({ ...draft, saleStart: e.target.value || undefined })
            }
            className="border-white/10 bg-white/5"
          />
          <p className="text-[10px] text-zinc-600">Leave empty to use event registration dates</p>
        </div>
        <div className="space-y-2">
          <Label>Registration closes (optional)</Label>
          <Input
            type="datetime-local"
            value={draft.saleEnd?.slice(0, 16) ?? ""}
            onChange={(e) => onDraft({ ...draft, saleEnd: e.target.value || undefined })}
            className="border-white/10 bg-white/5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description <span className="text-zinc-500">(optional)</span></Label>
        <Input
          value={draft.description ?? ""}
          onChange={(e) => onDraft({ ...draft, description: e.target.value })}
          className="border-white/10 bg-white/5"
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <input
          type="color"
          value={draft.ticketColor ?? "#9B5CFF"}
          onChange={(e) => onDraft({ ...draft, ticketColor: e.target.value })}
          className="h-10 w-full cursor-pointer rounded-lg border border-white/10"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" className="bg-accent-magenta" onClick={onSave}>
          Save segment
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function SegmentCreator({
  segments,
  onChange,
  onSetForm,
  segmentBookings = {},
  allowForceDelete = false,
}: SegmentCreatorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftSegment>(emptyDraft());
  const [inlineFormSegmentId, setInlineFormSegmentId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const startAdd = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowForm(true);
  };

  const startEdit = (seg: TicketSegment) => {
    setEditingId(seg.segmentId);
    setDraft({ ...seg });
    setShowForm(true);
  };

  const saveDraft = () => {
    if (!draft.name.trim()) return;
    const saved: TicketSegment = {
      ...(draft as TicketSegment),
      segmentId: editingId ?? `seg_${Date.now().toString(36)}`,
      status: draft.status ?? "active",
      remainingQuantity: draft.remainingQuantity ?? draft.capacity,
    };
    if (editingId) {
      onChange(segments.map((s) => (s.segmentId === editingId ? saved : s)));
    } else {
      onChange([...segments, saved]);
    }
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const oldIndex = segments.findIndex((s) => s.segmentId === a.id);
    const newIndex = segments.findIndex((s) => s.segmentId === over.id);
    onChange(arrayMove(segments, oldIndex, newIndex));
  };

  const inlineSegment = segments.find((s) => s.segmentId === inlineFormSegmentId);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-3">
        <Button type="button" onClick={startAdd} className="w-full gap-2 bg-accent-purple">
          <Plus className="h-4 w-4" />
          Add segment
        </Button>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={segments.map((s) => s.segmentId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {segments.length === 0 && !showForm && (
                <p className="text-sm text-zinc-500">No segments yet. Add your first ticket type.</p>
              )}
              {segments.map((seg) => (
                <SegmentListCard
                  key={seg.segmentId}
                  segment={seg}
                  allowForceDelete={allowForceDelete}
                  hasBookings={(segmentBookings[seg.segmentId] ?? 0) > 0}
                  onEdit={() => startEdit(seg)}
                  onSetForm={() => {
                    setInlineFormSegmentId(seg.segmentId);
                    onSetForm?.(seg.segmentId);
                  }}
                  onDelete={() => onChange(segments.filter((s) => s.segmentId !== seg.segmentId))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="min-w-0 space-y-4">
        {showForm && (
          <SegmentInlineForm
            draft={draft}
            onDraft={setDraft}
            onSave={saveDraft}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        )}
        {inlineSegment && (
          <div className="rounded-xl border border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-white">Form: {inlineSegment.name}</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => setInlineFormSegmentId(null)}>
                Close
              </Button>
            </div>
            <FormBuilder
              segmentId={inlineSegment.segmentId}
              fields={inlineSegment.formFields}
              onChange={(formFields) =>
                onChange(
                  segments.map((s) =>
                    s.segmentId === inlineSegment.segmentId ? { ...s, formFields } : s
                  )
                )
              }
            />
          </div>
        )}
        {!showForm && !inlineSegment && segments.length > 0 && (
          <p className="text-sm text-zinc-500">Select a segment to edit or use Set Form for registration fields.</p>
        )}
      </div>
    </div>
  );
}
