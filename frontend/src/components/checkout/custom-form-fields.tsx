"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField } from "@/types/models/event";

interface CustomFormFieldsProps {
  fields: FormField[];
  values: Record<string, string | string[] | boolean>;
  onChange: (key: string, value: string | string[] | boolean) => void;
}

export function CustomFormFields({ fields, values, onChange }: CustomFormFieldsProps) {
  const sorted = [...fields].sort((a, b) => a.order - b.order);

  if (!sorted.length) return null;

  return (
    <div className="space-y-4 rounded-xl border border-surface-border p-4">
      <p className="text-sm font-medium">Additional information</p>
      {sorted.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-brand"> *</span>}
          </Label>
          {field.type === "select" ? (
            <select
              className="flex h-11 w-full rounded-lg border border-surface-border bg-surface-elevated px-4 text-sm"
              value={(values[field.key] as string) ?? ""}
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
          ) : field.type === "textarea" ? (
            <textarea
              className="min-h-[80px] w-full rounded-lg border border-surface-border bg-surface-elevated px-4 py-2 text-sm"
              placeholder={field.placeholder}
              value={(values[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
            />
          ) : (
            <Input
              type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              placeholder={field.placeholder}
              value={(values[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
            />
          )}
        </div>
      ))}
    </div>
  );
}
