"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVisibleFields, type FormValues } from "@/lib/forms/conditional-form";
import type { DynamicFormField } from "@/lib/forms/form-field-types";

interface DynamicFormRendererProps {
  fields: DynamicFormField[];
  values: FormValues;
  onChange: (key: string, value: string | string[] | boolean) => void;
}

function inputType(field: DynamicFormField): string {
  if (field.type === "email") return "email";
  if (field.type === "phone") return "tel";
  if (field.type === "number") return "number";
  if (field.type === "date") return "date";
  if (field.type === "time") return "time";
  if (field.type === "url" || field.type === "social") return "url";
  return "text";
}

export function DynamicFormRenderer({ fields, values, onChange }: DynamicFormRendererProps) {
  const visible = getVisibleFields(fields, values);
  if (!visible.length) return null;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-surface-elevated/60 p-4">
      <p className="text-sm font-medium text-zinc-200">Registration details</p>
      {visible.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label className="text-zinc-300">
            {field.label}
            {field.required && <span className="text-accent-magenta"> *</span>}
          </Label>
          {field.helperText && <p className="text-xs text-zinc-500">{field.helperText}</p>}

          {field.type === "textarea" ? (
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-white/10 bg-[#12121e] px-4 py-2 text-sm"
              placeholder={field.placeholder}
              value={(values[field.key] as string) ?? ""}
              readOnly={field.readonly}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
            />
          ) : field.type === "select" || field.type === "experience-level" ? (
            <select
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#12121e] px-4 text-sm"
              value={(values[field.key] as string) ?? ""}
              disabled={field.readonly}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "multi-select" ? (
            <select
              multiple
              className="min-h-[88px] w-full rounded-lg border border-white/10 bg-[#12121e] px-4 py-2 text-sm"
              value={(values[field.key] as string[]) ?? []}
              onChange={(e) =>
                onChange(
                  field.key,
                  Array.from(e.target.selectedOptions).map((o) => o.value)
                )
              }
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "radio" ? (
            <div className="flex flex-wrap gap-3">
              {field.options?.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.key}
                    checked={values[field.key] === opt}
                    onChange={() => onChange(field.key, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" || field.type === "toggle" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!values[field.key]}
                onChange={(e) => onChange(field.key, e.target.checked)}
              />
              {field.placeholder ?? "Yes"}
            </label>
          ) : field.type === "file" || field.type === "image" ? (
            <Input
              type="file"
              accept={field.type === "image" ? "image/*" : undefined}
              onChange={(e) => onChange(field.key, e.target.files?.[0]?.name ?? "")}
            />
          ) : (
            <Input
              type={inputType(field)}
              placeholder={field.placeholder ?? field.defaultValue}
              value={(values[field.key] as string) ?? field.defaultValue ?? ""}
              readOnly={field.readonly}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
            />
          )}
        </div>
      ))}
    </div>
  );
}
