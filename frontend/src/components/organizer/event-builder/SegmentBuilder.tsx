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
import { Copy, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEGMENT_STATUS_CONFIG } from "@/components/organizer/event-builder/fieldConfig";
import { createDefaultSegment } from "@/components/organizer/event-builder/segmentDefaults";
import { SegmentEditor } from "@/components/organizer/event-builder/SegmentEditor";
import type { TicketSegment } from "@/types/eventBuilder.types";

interface SegmentBuilderProps {
  segments: TicketSegment[];
  onChange: (segments: TicketSegment[]) => void;
}

function SegmentCard({
  segment,
  selected,
  onSelect,
  onDuplicate,
}: {
  segment: TicketSegment;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: segment.segmentId,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const statusCfg = SEGMENT_STATUS_CONFIG[segment.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer rounded-xl border p-4 transition ${
        selected ? "border-accent-magenta/50 bg-accent-magenta/5" : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <button type="button" className="mt-1 text-zinc-500" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: segment.ticketColor ?? "#9B5CFF" }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{segment.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {segment.isFree ? "FREE" : `৳${segment.price}`} · {segment.capacity} cap · {segment.remainingQuantity} left
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusCfg.color}`}>{statusCfg.label}</span>
        <button
          type="button"
          className="text-zinc-500 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SegmentBuilder({ segments, onChange }: SegmentBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(segments[0]?.segmentId ?? null);
  const sensors = useSensors(useSensor(PointerSensor));
  const active = segments.find((s) => s.segmentId === activeId);

  const add = () => {
    const seg = createDefaultSegment(segments.length);
    onChange([...segments, seg]);
    setActiveId(seg.segmentId);
  };

  const duplicate = (seg: TicketSegment) => {
    const copy: TicketSegment = {
      ...seg,
      segmentId: `seg_${Date.now().toString(36)}`,
      name: `${seg.name} (copy)`,
      formFields: seg.formFields.map((f, i) => ({
        ...f,
        fieldId: `field_${Date.now().toString(36)}_${i}`,
      })),
    };
    onChange([...segments, copy]);
    setActiveId(copy.segmentId);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const oldIndex = segments.findIndex((s) => s.segmentId === a.id);
    const newIndex = segments.findIndex((s) => s.segmentId === over.id);
    onChange(arrayMove(segments, oldIndex, newIndex));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <Button type="button" onClick={add} className="w-full gap-2 bg-accent-purple hover:bg-accent-purple/90">
          <Plus className="h-4 w-4" />
          Add segment
        </Button>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={segments.map((s) => s.segmentId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {segments.map((seg) => (
                <SegmentCard
                  key={seg.segmentId}
                  segment={seg}
                  selected={seg.segmentId === activeId}
                  onSelect={() => setActiveId(seg.segmentId)}
                  onDuplicate={() => duplicate(seg)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {active ? (
        <SegmentEditor
          segment={active}
          onChange={(updated) =>
            onChange(segments.map((s) => (s.segmentId === updated.segmentId ? updated : s)))
          }
          onDelete={() => {
            onChange(segments.filter((s) => s.segmentId !== active.segmentId));
            setActiveId(segments[0]?.segmentId ?? null);
          }}
        />
      ) : (
        <p className="text-sm text-zinc-500">Add a ticket segment to get started.</p>
      )}
    </div>
  );
}
