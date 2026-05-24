import mongoose from "mongoose";
import {
  PlatformSettings,
  type PlatformSettingsDocument,
} from "@/modules/admin/models/platformSettings.model.js";

const SINGLETON_KEY = "default";

let cachedSettings: PlatformSettingsDocument | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 30_000;

export async function getPlatformSettings(): Promise<PlatformSettingsDocument> {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiresAt) {
    return cachedSettings;
  }

  let doc = await PlatformSettings.findOne({ singletonKey: SINGLETON_KEY });
  if (!doc) {
    doc = await PlatformSettings.create({ singletonKey: SINGLETON_KEY });
  }

  cachedSettings = doc;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return doc;
}

export function invalidatePlatformSettingsCache() {
  cachedSettings = null;
  cacheExpiresAt = 0;
  void import("@/modules/events/utils/event-cache.util.js").then((m) => {
    m.invalidatePlatformStatusCache();
  });
}

export async function getServiceFeeRate(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.fees.serviceFeePercent / 100;
}

export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings.platform.maintenanceMode;
}

export async function getPublicPlatformStatus() {
  const { cacheGet, cacheSet } = await import("@/shared/cache/cache.service.js");
  const { PLATFORM_STATUS_CACHE_KEY } = await import(
    "@/modules/events/utils/event-cache.util.js"
  );
  const cached = cacheGet<{ maintenanceMode: boolean; serviceFeePercent: number }>(
    PLATFORM_STATUS_CACHE_KEY
  );
  if (cached) return cached;

  const settings = await getPlatformSettings();
  const payload = {
    maintenanceMode: settings.platform.maintenanceMode,
    serviceFeePercent: settings.fees.serviceFeePercent,
  };
  cacheSet(PLATFORM_STATUS_CACHE_KEY, payload, 60);
  return payload;
}

function toPlain(doc: PlatformSettingsDocument) {
  const obj = doc.toObject();
  return {
    ...obj,
    _id: obj._id.toString(),
    updatedBy: obj.updatedBy?.toString(),
  };
}

export async function getSettingsForAdmin() {
  const doc = await getPlatformSettings();
  return toPlain(doc);
}

async function patchSection<K extends keyof PlatformSettingsDocument>(
  section: K,
  data: Partial<PlatformSettingsDocument[K]>,
  updatedBy?: string
) {
  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as object)) {
    update[`${String(section)}.${key}`] = value;
  }
  if (updatedBy) {
    update.updatedBy = new mongoose.Types.ObjectId(updatedBy);
  }

  const doc = await PlatformSettings.findOneAndUpdate(
    { singletonKey: SINGLETON_KEY },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  invalidatePlatformSettingsCache();
  return toPlain(doc!);
}

export const patchPlatformSettings = (
  data: Partial<PlatformSettingsDocument["platform"]>,
  updatedBy?: string
) => patchSection("platform", data, updatedBy);

export const patchFeeSettings = (
  data: Partial<PlatformSettingsDocument["fees"]>,
  updatedBy?: string
) => patchSection("fees", data, updatedBy);

export const patchEventControlSettings = (
  data: Partial<PlatformSettingsDocument["eventControls"]>,
  updatedBy?: string
) => patchSection("eventControls", data, updatedBy);

export const patchOrganizerControlSettings = (
  data: Partial<PlatformSettingsDocument["organizerControls"]>,
  updatedBy?: string
) => patchSection("organizerControls", data, updatedBy);

export const patchSecuritySettings = (
  data: Partial<PlatformSettingsDocument["security"]>,
  updatedBy?: string
) => patchSection("security", data, updatedBy);

export const patchTrackingSettings = (
  data: Partial<PlatformSettingsDocument["tracking"]>,
  updatedBy?: string
) => patchSection("tracking", data, updatedBy);

export async function clearPlatformCache(updatedBy?: string) {
  const doc = await PlatformSettings.findOneAndUpdate(
    { singletonKey: SINGLETON_KEY },
    { $set: { cacheLastClearedAt: new Date(), ...(updatedBy ? { updatedBy } : {}) } },
    { new: true, upsert: true }
  );
  invalidatePlatformSettingsCache();
  return doc?.cacheLastClearedAt ?? new Date();
}
