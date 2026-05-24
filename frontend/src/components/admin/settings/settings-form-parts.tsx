"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[#FF3EA5]"
      />
    </label>
  );
}

export function FieldRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-300">{label}</Label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function SaveBar({
  saving,
  onSave,
  readOnly,
  label = "Save changes",
}: {
  saving: boolean;
  onSave: () => void;
  readOnly?: boolean;
  label?: string;
}) {
  if (readOnly) {
    return (
      <p className="text-xs text-amber-400/90">View only — super admin required to save changes.</p>
    );
  }
  return (
    <button
      type="button"
      disabled={saving}
      onClick={onSave}
      className="rounded-lg bg-[#FF3EA5] px-5 py-2 text-sm font-medium text-white hover:bg-[#FF3EA5]/90 disabled:opacity-50"
    >
      {saving ? "Saving…" : label}
    </button>
  );
}

export function TextInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={`border-white/10 bg-white/5 text-white placeholder:text-zinc-600 ${props.className ?? ""}`}
    />
  );
}
