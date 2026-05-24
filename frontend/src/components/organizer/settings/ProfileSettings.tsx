"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patchOrganizerProfile, type OrganizerSettings } from "@/services/organizer/settings.service";
import { getApiErrorMessage } from "@/services/api/client";

export function ProfileSettings({
  settings,
  onSaved,
}: {
  settings: OrganizerSettings;
  onSaved: (s: OrganizerSettings) => void;
}) {
  const [name, setName] = useState(settings.profile.name);
  const [phone, setPhone] = useState(settings.profile.phone);
  const [bio, setBio] = useState(settings.profile.bio);
  const [social, setSocial] = useState(settings.profile.socialLinks);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = async () => {
    setLoading(true);
    try {
      const data = await patchOrganizerProfile({ name, phone, bio, socialLinks: social });
      onSaved(data);
      setDirty(false);
      toast.success("Profile saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const mark = () => setDirty(true);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => { setName(e.target.value); mark(); }} required className="border-white/10 bg-white/5" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={settings.profile.email ?? ""} disabled className="border-white/10 bg-white/5 opacity-60" />
          <p className="text-xs text-zinc-500">Contact support to change email</p>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => { setPhone(e.target.value); mark(); }} className="border-white/10 bg-white/5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Bio / About</Label>
        <textarea
          value={bio}
          maxLength={300}
          onChange={(e) => { setBio(e.target.value); mark(); }}
          className="min-h-24 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
        <p className="text-xs text-zinc-500">{bio.length}/300</p>
      </div>
      <div className="space-y-1.5">
        <Label>Website URL</Label>
        <Input
          value={social.website ?? ""}
          onChange={(e) => { setSocial((s) => ({ ...s, website: e.target.value })); mark(); }}
          placeholder="https://"
          className="border-white/10 bg-white/5"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["facebook", "instagram", "linkedin", "twitter", "youtube"] as const).map((key) => (
          <div key={key} className="space-y-1.5">
            <Label className="capitalize">{key === "twitter" ? "Twitter / X" : key}</Label>
            <Input
              value={social[key] ?? ""}
              onChange={(e) => { setSocial((s) => ({ ...s, [key]: e.target.value })); mark(); }}
              placeholder="https://"
              className="border-white/10 bg-white/5"
            />
          </div>
        ))}
      </div>
      <Button onClick={() => void save()} disabled={loading} className="bg-accent-magenta hover:bg-accent-magenta/90">
        {loading ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
}
