"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/media/image-upload";
import { BD_CITIES } from "@/constants/bd-cities";
import { routes } from "@/config/routes";
import { patchOrganizerOrganization, type OrganizerSettings } from "@/services/organizer/settings.service";
import { getApiErrorMessage } from "@/services/api/client";

const ORG_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "ngo", label: "NGO" },
  { value: "university_club", label: "University Club" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

export function OrganizationSettings({
  settings,
  onSaved,
}: {
  settings: OrganizerSettings;
  onSaved: (s: OrganizerSettings) => void;
}) {
  const org = settings.organization;
  const [businessName, setBusinessName] = useState(org.orgName ?? org.businessName ?? "");
  const [organizationType, setOrganizationType] = useState(org.orgType ?? "individual");
  const [description, setDescription] = useState(org.description);
  const [logo, setLogo] = useState<string | undefined>(org.logo);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(org.coverPhoto);
  const [businessAddress, setBusinessAddress] = useState(org.address ?? "");
  const [city, setCity] = useState(org.city || "Dhaka");
  const [establishedYear, setEstablishedYear] = useState(org.establishedYear?.toString() ?? "");
  const [licenseNumber, setLicenseNumber] = useState(org.licenseNumber);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = async () => {
    setLoading(true);
    try {
      const data = await patchOrganizerOrganization({
        businessName,
        organizationType,
        description,
        logo,
        coverPhoto,
        businessAddress,
        city,
        establishedYear: establishedYear ? Number(establishedYear) : undefined,
        licenseNumber,
      });
      onSaved(data);
      setDirty(false);
      toast.success("Organization saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageUpload
        label="Logo"
        folder="organizers/logos"
        aspectRatio="square"
        value={logo ?? null}
        onChange={(v) => {
          setLogo(v);
          setDirty(true);
        }}
      />
      <ImageUpload
        label="Cover photo"
        folder="organizers/covers"
        aspectRatio="cover"
        value={coverPhoto ?? null}
        onChange={(v) => {
          setCoverPhoto(v);
          setDirty(true);
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Organization / Company name</Label>
          <Input value={businessName} onChange={(e) => { setBusinessName(e.target.value); setDirty(true); }} required className="border-white/10 bg-white/5" />
        </div>
        <div className="space-y-1.5">
          <Label>Organization type</Label>
          <select value={organizationType} onChange={(e) => { setOrganizationType(e.target.value); setDirty(true); }} className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm">
            {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <select value={city} onChange={(e) => { setCity(e.target.value); setDirty(true); }} className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm">
            {BD_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <textarea
          value={description}
          maxLength={500}
          onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
          className="min-h-28 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
        <p className="text-xs text-zinc-500">{description.length}/500</p>
      </div>
      <div className="space-y-1.5">
        <Label>Business address</Label>
        <Input value={businessAddress} onChange={(e) => { setBusinessAddress(e.target.value); setDirty(true); }} className="border-white/10 bg-white/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Established year (optional)</Label>
          <Input value={establishedYear} onChange={(e) => { setEstablishedYear(e.target.value); setDirty(true); }} className="border-white/10 bg-white/5" />
        </div>
        <div className="space-y-1.5">
          <Label>NID / Trade license (optional)</Label>
          <Input value={licenseNumber} onChange={(e) => { setLicenseNumber(e.target.value); setDirty(true); }} className="border-white/10 bg-white/5" />
          <p className="text-xs text-zinc-500">Required for payout verification</p>
        </div>
      </div>
      <Link href={routes.organizerProfile(org.slug ?? "")} className="text-sm text-accent-magenta hover:underline" target="_blank">
        View your public profile →
      </Link>
      <Button onClick={() => void save()} disabled={loading} className="bg-accent-magenta hover:bg-accent-magenta/90">
        {loading ? "Saving…" : "Save organization"}
      </Button>
    </div>
  );
}
