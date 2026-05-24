import NodeCache from "node-cache";
import { getPlatformSettings } from "@/modules/admin/services/platformSettings.service.js";
import type { PlatformSettingsDocument } from "@/modules/admin/models/platformSettings.model.js";

export interface PublicTrackingConfig {
  metaPixelId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
}

const CACHE_KEY = "public-tracking-config";
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function toPublicTracking(doc: PlatformSettingsDocument): PublicTrackingConfig {
  const tracking = doc.tracking ?? {
    metaPixelId: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
  };
  return {
    metaPixelId: tracking.metaPixelId ?? "",
    googleAnalyticsId: tracking.googleAnalyticsId ?? "",
    googleTagManagerId: tracking.googleTagManagerId ?? "",
  };
}

export async function getPublicTrackingConfig(): Promise<PublicTrackingConfig> {
  const cached = cache.get<PublicTrackingConfig>(CACHE_KEY);
  if (cached) return cached;

  const doc = await getPlatformSettings();
  const config = toPublicTracking(doc);
  cache.set(CACHE_KEY, config);
  return config;
}

export function invalidatePublicTrackingCache() {
  cache.del(CACHE_KEY);
}
