"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { FieldRow, TextInput } from "@/components/admin/settings/settings-form-parts";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { fetchEvents } from "@/services/events/events.service";

const SOURCES = ["facebook", "instagram", "google"] as const;
const MEDIUMS = ["paid", "organic", "story", "reel"] as const;

export function CampaignUrlBuilder() {
  const [eventSlug, setEventSlug] = useState("");
  const [source, setSource] = useState<(typeof SOURCES)[number]>("facebook");
  const [medium, setMedium] = useState<(typeof MEDIUMS)[number]>("paid");
  const [campaign, setCampaign] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-campaign-events"],
    queryFn: () => fetchEvents({ limit: 100 }),
  });

  const events = (data?.data.events ?? []).filter((ev) => ev.status === "live");

  const baseUrl = eventSlug
    ? `${siteConfig.url}${routes.event(eventSlug)}`
    : siteConfig.url;

  const generatedUrl = useMemo(() => {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    if (campaign.trim()) url.searchParams.set("utm_campaign", campaign.trim());
    return url.toString();
  }, [baseUrl, source, medium, campaign]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success("Campaign URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <div className="mt-10 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div>
        <h3 className="text-sm font-semibold text-white">Campaign URL builder</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Build tracked links for Facebook ads. UTMs persist for the buyer session.
        </p>
      </div>

      <FieldRow label="Event (optional)">
        <select
          className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
          value={eventSlug}
          onChange={(e) => setEventSlug(e.target.value)}
        >
          <option value="">Homepage ({siteConfig.url})</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev.slug}>
              {ev.title}
            </option>
          ))}
        </select>
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-3">
        <FieldRow label="UTM source">
          <select
            className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value as (typeof SOURCES)[number])}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="UTM medium">
          <select
            className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
            value={medium}
            onChange={(e) => setMedium(e.target.value as (typeof MEDIUMS)[number])}
          >
            {MEDIUMS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="UTM campaign">
          <TextInput
            placeholder="spring-concert-2026"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          />
        </FieldRow>
      </div>

      <FieldRow label="Generated URL">
        <TextInput readOnly value={generatedUrl} className="font-mono text-xs" />
      </FieldRow>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="gap-2" onClick={copyUrl}>
          <Copy className="h-4 w-4" />
          Copy URL
        </Button>
        <Button type="button" variant="outline" className="gap-2 border-white/15" asChild>
          <a href="https://www.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open Facebook Ads Manager
          </a>
        </Button>
      </div>
    </div>
  );
}
