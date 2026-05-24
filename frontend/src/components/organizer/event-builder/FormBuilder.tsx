"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { FormField } from "@/types/eventBuilder.types";
import { FieldType } from "@/types/eventBuilder.types";
import {
  createDefaultField,
  FIELD_TYPES_BY_CATEGORY,
  FIELD_TYPE_CONFIG,
} from "@/components/organizer/event-builder/fieldConfig";
import { FieldEditor } from "@/components/organizer/event-builder/FieldEditor";

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  segmentId?: string | null;
}

function SortableFieldRow({
  field,
  selected,
  onSelect,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.fieldId,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = FIELD_TYPE_CONFIG[field.type as FieldType]?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
        selected ? "border-accent-magenta/50 bg-accent-magenta/10" : "border-white/10 bg-white/5"
      }`}
      onClick={onSelect}
    >
      <button type="button" className="touch-none text-zinc-500" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      {Icon && <Icon className="h-4 w-4 text-accent-purple" />}
      <span className="flex-1 text-sm text-zinc-200">{field.label}</span>
      <span className="text-xs text-zinc-500">{field.type}</span>
    </div>
  );
}

export function FormBuilder({ fields, onChange, segmentId }: FormBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(fields[0]?.fieldId ?? null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selected = fields.find((f) => f.fieldId === selectedId);

  const addField = (type: FieldType) => {
    const next = [...fields, createDefaultField(type, fields.length)];
    onChange(next);
    setSelectedId(next[next.length - 1].fieldId);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.fieldId === active.id);
    const newIndex = fields.findIndex((f) => f.fieldId === over.id);
    const moved = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({ ...f, order: i }));
    onChange(moved);
  };

  return (
    <div className="flex min-h-[420px] gap-0 rounded-xl border border-white/10 overflow-hidden">
      <aside className="w-48 shrink-0 border-r border-white/10 bg-[#0a0e1a] p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          {segmentId ? "Segment form" : "Global form"}
        </p>
        {(["basic", "contact", "file", "advanced"] as const).map((cat) => (
          <div key={cat} className="mb-3">
            <p className="mb-1 text-[10px] uppercase text-zinc-600">{cat}</p>
            <div className="flex flex-col gap-1">
              {FIELD_TYPES_BY_CATEGORY[cat].map((type) => {
                const cfg = FIELD_TYPE_CONFIG[type];
                const Icon = cfg.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addField(type)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      <div className="flex flex-1 flex-col p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={fields.map((f) => f.fieldId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {fields.length === 0 && (
                <p className="text-sm text-zinc-500">Click a field type to add to the form.</p>
              )}
              {fields.map((f) => (
                <SortableFieldRow
                  key={f.fieldId}
                  field={f}
                  selected={f.fieldId === selectedId}
                  onSelect={() => setSelectedId(f.fieldId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {selected && (
        <div className="w-72 shrink-0">
          <FieldEditor
            field={selected}
            allFields={fields}
            onChange={(updated) =>
              onChange(fields.map((f) => (f.fieldId === updated.fieldId ? updated : f)))
            }
            onDelete={() => {
              onChange(fields.filter((f) => f.fieldId !== selected.fieldId));
              setSelectedId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
