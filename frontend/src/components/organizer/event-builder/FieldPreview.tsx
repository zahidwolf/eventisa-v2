"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField } from "@/types/eventBuilder.types";
import { FieldType } from "@/types/eventBuilder.types";

interface FieldPreviewProps {
  field: FormField;
  value?: string | string[] | boolean | number;
  onChange?: (fieldId: string, value: string | string[] | boolean | number) => void;
  dimmed?: boolean;
}

export function FieldPreview({ field, value, onChange, dimmed }: FieldPreviewProps) {
  const id = field.fieldId;
  const disabled = dimmed || field.readonly;
  const cls = dimmed ? "opacity-40 pointer-events-none" : "";

  const set = (v: string | string[] | boolean | number) => onChange?.(id, v);

  const label = (
    <Label className="text-zinc-200">
      {field.label}
      {field.required && <span className="text-accent-magenta ml-1">*</span>}
    </Label>
  );

  const helper = field.helperText ? (
    <p className="text-xs text-zinc-500">{field.helperText}</p>
  ) : null;

  const wrap = (child: React.ReactNode) => (
    <div className={`space-y-1.5 ${cls}`}>
      {label}
      {child}
      {helper}
    </div>
  );

  switch (field.type) {
    case FieldType.Textarea:
      return wrap(
        <textarea
          className="min-h-[80px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          placeholder={field.placeholder}
          value={(value as string) ?? field.defaultValue ?? ""}
          disabled={disabled}
          onChange={(e) => set(e.target.value)}
        />
      );
    case FieldType.Select:
      return wrap(
        <select
          className="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-white"
          value={(value as string) ?? ""}
          disabled={disabled}
          onChange={(e) => set(e.target.value)}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case FieldType.MultiSelect:
      return wrap(
        <select
          multiple
          className="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-white"
          disabled={disabled}
          onChange={(e) =>
            set(Array.from(e.target.selectedOptions).map((o) => o.value))
          }
        >
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case FieldType.Radio:
      return wrap(
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name={id}
                checked={value === o}
                disabled={disabled}
                onChange={() => set(o)}
              />
              {o}
            </label>
          ))}
        </div>
      );
    case FieldType.Checkbox:
      return wrap(
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={value === true}
            disabled={disabled}
            onChange={(e) => set(e.target.checked)}
          />
          {field.placeholder ?? field.label}
        </label>
      );
    case FieldType.Toggle:
      return wrap(
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="h-5 w-9 appearance-none rounded-full bg-white/10 checked:bg-accent-magenta"
            checked={value === true}
            disabled={disabled}
            onChange={(e) => set(e.target.checked)}
          />
          {field.placeholder ?? "Enabled"}
        </label>
      );
    case FieldType.File:
    case FieldType.Image:
      return wrap(
        <Input
          type="file"
          disabled={disabled}
          className="border-white/10 bg-white/5 text-zinc-400"
          onChange={() => set("uploaded")}
        />
      );
    default:
      return wrap(
        <Input
          type={
            field.type === FieldType.Email
              ? "email"
              : field.type === FieldType.Phone
                ? "tel"
                : field.type === FieldType.Number
                  ? "number"
                  : field.type === FieldType.Date
                    ? "date"
                    : field.type === FieldType.Time
                      ? "time"
                      : field.type === FieldType.Url || field.type === FieldType.SocialLink
                        ? "url"
                        : "text"
          }
          placeholder={field.placeholder ?? field.defaultValue}
          value={(value as string) ?? ""}
          disabled={disabled}
          className="border-white/10 bg-white/5 text-white"
          onChange={(e) => set(e.target.value)}
        />
      );
  }
}
