"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORM_FIELD_TYPES, type DynamicFormField } from "@/lib/forms/form-field-types";

interface DynamicFormBuilderProps {
  fields: DynamicFormField[];
  onChange: (fields: DynamicFormField[]) => void;
  compact?: boolean;
}

export function DynamicFormBuilder({ fields, onChange, compact }: DynamicFormBuilderProps) {
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

  const update = (index: number, patch: Partial<DynamicFormField>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index: number) => onChange(fields.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...fields];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    onChange(next.map((f, i) => ({ ...f, order: i })));
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={`${field.key}-${index}`}
          className="rounded-xl border border-white/10 bg-[#12121e]/80 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-zinc-600" />
            <span className="text-xs text-zinc-500">Field {index + 1}</span>
            <div className="ml-auto flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)}>
                ↑
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)}>
                ↓
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>
          <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={field.label} onChange={(e) => update(index, { label: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Key</Label>
              <Input value={field.key} onChange={(e) => update(index, { key: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
                value={field.type}
                onChange={(e) => update(index, { type: e.target.value })}
              >
                {FORM_FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => update(index, { required: e.target.checked })}
                />
                Required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.hidden}
                  onChange={(e) => update(index, { hidden: e.target.checked })}
                />
                Hidden
              </label>
            </div>
            {!compact && (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Placeholder</Label>
                  <Input
                    value={field.placeholder ?? ""}
                    onChange={(e) => update(index, { placeholder: e.target.value })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Helper text</Label>
                  <Input
                    value={field.helperText ?? ""}
                    onChange={(e) => update(index, { helperText: e.target.value })}
                  />
                </div>
              </>
            )}
            {(field.type === "select" ||
              field.type === "radio" ||
              field.type === "multi-select") && (
              <div className="space-y-1 sm:col-span-2">
                <Label>Options (comma-separated)</Label>
                <Input
                  value={field.options?.join(", ") ?? ""}
                  onChange={(e) =>
                    update(index, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}
            {!compact && (
              <div className="space-y-1 sm:col-span-2 rounded-lg border border-dashed border-white/10 p-3">
                <Label className="text-xs text-zinc-500">Show when (conditional)</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Field key"
                    value={field.showWhen?.fieldKey ?? ""}
                    onChange={(e) =>
                      update(index, {
                        showWhen: {
                          fieldKey: e.target.value,
                          operator: field.showWhen?.operator ?? "equals",
                          value: field.showWhen?.value,
                        },
                      })
                    }
                  />
                  <select
                    className="h-11 rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
                    value={field.showWhen?.operator ?? "equals"}
                    onChange={(e) =>
                      update(index, {
                        showWhen: {
                          fieldKey: field.showWhen?.fieldKey ?? "",
                          operator: e.target.value as "equals" | "not_equals" | "contains" | "checked",
                          value: field.showWhen?.value,
                        },
                      })
                    }
                  >
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="checked">checked</option>
                  </select>
                  <Input
                    placeholder="Value"
                    value={String(field.showWhen?.value ?? "")}
                    onChange={(e) =>
                      update(index, {
                        showWhen: {
                          fieldKey: field.showWhen?.fieldKey ?? "",
                          operator: field.showWhen?.operator ?? "equals",
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addField} className="border-white/15">
        <Plus className="mr-2 h-4 w-4" />
        Add field
      </Button>
    </div>
  );
}
