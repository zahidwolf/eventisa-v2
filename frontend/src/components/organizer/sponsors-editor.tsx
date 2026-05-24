"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/media/image-upload";
import type { EventSponsor, SponsorTier } from "@/types/models/university";

const TIERS: { value: SponsorTier; label: string }[] = [
  { value: "title", label: "Title Sponsor" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "community", label: "Community Partner" },
];

export function SponsorsEditor({
  sponsors,
  onChange,
}: {
  sponsors: EventSponsor[];
  onChange: (s: EventSponsor[]) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Sponsors</p>
      {sponsors.map((s, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-white/10 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={s.name}
                onChange={(e) => {
                  const n = [...sponsors];
                  n[i] = { ...n[i], name: e.target.value };
                  onChange(n);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Tier</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
                value={s.tier}
                onChange={(e) => {
                  const n = [...sponsors];
                  n[i] = { ...n[i], tier: e.target.value as SponsorTier };
                  onChange(n);
                }}
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ImageUpload
            label="Logo"
            uploadType="sponsor-logo"
            value={s.logo}
            onChange={(url) => {
              const n = [...sponsors];
              n[i] = { ...n[i], logo: url };
              onChange(n);
            }}
            aspect="square"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(sponsors.filter((_, j) => j !== i))}>
            Remove sponsor
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([...sponsors, { name: "Sponsor", logo: "", tier: "community", order: sponsors.length }])
        }
      >
        Add sponsor
      </Button>
    </div>
  );
}
