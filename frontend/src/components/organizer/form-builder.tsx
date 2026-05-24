"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField } from "@/types/models/event";

const FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "select",
  "radio",
  "checkbox",
  "textarea",
  "file",
] as const;

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const addField = () => {
    onChange([
      ...fields,
      {
        key: `field_${fields.length + 1}`,
        label: "New field",
        type: "text",
        required: false,
        order: fields.length,
      },
    ]);
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((f, i) => ({ ...f, order: i })));
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={`${field.key}-${index}`}
          className="rounded-xl border border-surface-border bg-surface-elevated/50 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Field {index + 1}</span>
            <div className="ml-auto flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => moveField(index, -1)}>
                ↑
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => moveField(index, 1)}>
                ↓
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeField(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Key</Label>
              <Input
                value={field.key}
                onChange={(e) => updateField(index, { key: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 text-sm"
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                />
                Required
              </label>
            </div>
            {(field.type === "select" || field.type === "radio") && (
              <div className="space-y-1 sm:col-span-2">
                <Label>Options (comma-separated)</Label>
                <Input
                  value={field.options?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addField}>
        <Plus className="mr-2 h-4 w-4" />
        Add field
      </Button>
    </div>
  );
}
