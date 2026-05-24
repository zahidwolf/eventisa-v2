"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConditionalAction, ConditionalOperator, FormField } from "@/types/eventBuilder.types";
import { FIELD_TYPE_CONFIG } from "@/components/organizer/event-builder/fieldConfig";

interface FieldEditorProps {
  field: FormField;
  allFields: FormField[];
  onChange: (field: FormField) => void;
  onDelete: () => void;
}

const OPERATORS: ConditionalOperator[] = [
  "equals",
  "not_equals",
  "contains",
  "checked",
  "empty",
  "not_empty",
];

const ACTIONS: ConditionalAction[] = ["show", "hide", "require", "unrequire"];

export function FieldEditor({ field, allFields, onChange, onDelete }: FieldEditorProps) {
  const [tab, setTab] = useState<"basic" | "validation" | "conditional">("basic");
  const cfg = FIELD_TYPE_CONFIG[field.type as keyof typeof FIELD_TYPE_CONFIG];
  const patch = (p: Partial<FormField>) => onChange({ ...field, ...p });
  const logic = field.conditionalLogic ?? {
    dependsOn: "",
    operator: "equals" as ConditionalOperator,
    value: "",
    action: "show" as ConditionalAction,
  };

  return (
    <div className="flex h-full flex-col border-l border-white/10 bg-[#0c1020] p-4">
      <div className="mb-4 flex gap-2">
        {(["basic", "validation", "conditional"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-xs capitalize ${
              tab === t ? "bg-accent-purple/30 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "conditional" ? "Logic" : t}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="space-y-3 overflow-y-auto">
          <div>
            <Label>Label</Label>
            <Input value={field.label} onChange={(e) => patch({ label: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
          </div>
          <div>
            <Label>Placeholder</Label>
            <Input value={field.placeholder ?? ""} onChange={(e) => patch({ placeholder: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
          </div>
          <div>
            <Label>Helper text</Label>
            <Input value={field.helperText ?? ""} onChange={(e) => patch({ helperText: e.target.value })} className="mt-1 border-white/10 bg-white/5" />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={field.required} onChange={(e) => patch({ required: e.target.checked })} />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={!!field.hidden} onChange={(e) => patch({ hidden: e.target.checked })} />
            Hidden by default
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={!!field.readonly} onChange={(e) => patch({ readonly: e.target.checked })} />
            Read only
          </label>
          {cfg?.hasOptions && (
            <div>
              <Label>Options (comma-separated)</Label>
              <Input
                value={(field.options ?? []).join(", ")}
                onChange={(e) =>
                  patch({ options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                }
                className="mt-1 border-white/10 bg-white/5"
              />
            </div>
          )}
        </div>
      )}

      {tab === "validation" && (
        <div className="space-y-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Min length</Label>
              <Input type="number" value={field.validation?.minLength ?? ""} onChange={(e) => patch({ validation: { ...field.validation, minLength: Number(e.target.value) || undefined } })} className="mt-1 border-white/10 bg-white/5" />
            </div>
            <div>
              <Label>Max length</Label>
              <Input type="number" value={field.validation?.maxLength ?? ""} onChange={(e) => patch({ validation: { ...field.validation, maxLength: Number(e.target.value) || undefined } })} className="mt-1 border-white/10 bg-white/5" />
            </div>
          </div>
          <div>
            <Label>Regex</Label>
            <Input value={field.validation?.regex ?? ""} onChange={(e) => patch({ validation: { ...field.validation, regex: e.target.value } })} className="mt-1 border-white/10 bg-white/5" />
          </div>
          <div>
            <Label>Regex message</Label>
            <Input value={field.validation?.regexMessage ?? ""} onChange={(e) => patch({ validation: { ...field.validation, regexMessage: e.target.value } })} className="mt-1 border-white/10 bg-white/5" />
          </div>
          {(field.type === "file" || field.type === "image") && (
            <>
              <div>
                <Label>Max file size (MB)</Label>
                <Input type="number" value={field.validation?.maxFileSizeMB ?? ""} onChange={(e) => patch({ validation: { ...field.validation, maxFileSizeMB: Number(e.target.value) || undefined } })} className="mt-1 border-white/10 bg-white/5" />
              </div>
              <div>
                <Label>Allowed types</Label>
                <Input value={(field.validation?.allowedFileTypes ?? []).join(", ")} onChange={(e) => patch({ validation: { ...field.validation, allowedFileTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })} className="mt-1 border-white/10 bg-white/5" />
              </div>
            </>
          )}
        </div>
      )}

      {tab === "conditional" && cfg?.supportsConditional && (
        <div className="space-y-3 overflow-y-auto">
          <div>
            <Label>Depends on</Label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm"
              value={logic.dependsOn}
              onChange={(e) => patch({ conditionalLogic: { ...logic, dependsOn: e.target.value } })}
            >
              <option value="">—</option>
              {allFields
                .filter((f) => f.fieldId !== field.fieldId)
                .map((f) => (
                  <option key={f.fieldId} value={f.fieldId}>
                    {f.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Operator</Label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm"
              value={logic.operator}
              onChange={(e) => patch({ conditionalLogic: { ...logic, operator: e.target.value as ConditionalOperator } })}
            >
              {OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Value</Label>
            <Input value={String(logic.value ?? "")} onChange={(e) => patch({ conditionalLogic: { ...logic, value: e.target.value } })} className="mt-1 border-white/10 bg-white/5" />
          </div>
          <div>
            <Label>Action</Label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm"
              value={logic.action}
              onChange={(e) => patch({ conditionalLogic: { ...logic, action: e.target.value as ConditionalAction } })}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Button type="button" variant="destructive" className="mt-auto gap-2" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
        Delete field
      </Button>
    </div>
  );
}
