import mongoose from "mongoose";
import { HomepageConfig } from "@/modules/homepage/models/homepage-config.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { EventStatus, EventApprovalStatus } from "@/modules/events/types/event.types.js";
import {
  mapEventsToPublicListByIds,
  type PublicEventListItem,
} from "@/modules/events/services/event-public.service.js";
import { cacheGet, cacheSet } from "@/shared/cache/cache.service.js";
import {
  FEATURED_EVENTS_CACHE_KEY,
  invalidateFeaturedEventsCache,
  invalidatePublicEventCaches,
} from "@/modules/events/utils/event-cache.util.js";

export { invalidateFeaturedEventsCache };

export async function getOrCreateHomepageConfig() {
  let doc = await HomepageConfig.findOne();
  if (!doc) {
    doc = await HomepageConfig.create({});
  }
  return doc;
}

type HomepageUpdate = Partial<{
  heroBanners: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaLabel?: string;
    ctaHref?: string;
    order: number;
    active: boolean;
  }[];
  featuredEventIds: string[];
  trendingEventIds: string[];
  categoryVisibility: { slug: string; visible: boolean; order: number }[];
}>;

async function orderEventsByIds(
  ids: mongoose.Types.ObjectId[],
  filter: Record<string, unknown>
) {
  if (!ids.length) return [];
  const events = await Event.find({ _id: { $in: ids }, ...filter }).populate(
    "organizer",
    "businessName slug logo"
  );
  const byId = new Map(events.map((e) => [e._id.toString(), e]));
  return ids.map((id) => byId.get(id.toString())).filter(Boolean) as typeof events;
}

export async function setFeaturedEventIds(featuredEventIds: string[], updatedBy: string) {
  const doc = await getOrCreateHomepageConfig();
  const next = featuredEventIds.map((id) => new mongoose.Types.ObjectId(id));

  doc.featuredEventIds = next;
  doc.updatedBy = updatedBy as unknown as typeof doc.updatedBy;
  await doc.save();

  // Only curated events stay featured; clear seed/legacy featured flags too.
  await Event.updateMany(
    { _id: { $nin: next }, featured: true },
    { featured: false, homepagePriority: 0 }
  );

  for (let i = 0; i < featuredEventIds.length; i++) {
    await Event.findByIdAndUpdate(featuredEventIds[i], {
      featured: true,
      homepagePriority: 1000 - i,
    });
  }

  invalidatePublicEventCaches();
  return doc;
}

export async function setTrendingEventIds(trendingEventIds: string[], updatedBy: string) {
  const doc = await getOrCreateHomepageConfig();
  const previous = doc.trendingEventIds.map((id) => id.toString());
  const next = trendingEventIds.map((id) => new mongoose.Types.ObjectId(id));

  doc.trendingEventIds = next;
  doc.updatedBy = updatedBy as unknown as typeof doc.updatedBy;
  await doc.save();

  const removed = previous.filter((id) => !trendingEventIds.includes(id));
  if (removed.length) {
    await Event.updateMany({ _id: { $in: removed } }, { trending: false });
  }

  if (trendingEventIds.length) {
    await Event.updateMany({ _id: { $in: trendingEventIds } }, { trending: true });
  }

  invalidatePublicEventCaches();
  return doc;
}

export async function updateHomepageConfig(input: HomepageUpdate, updatedBy: string) {
  if (input.featuredEventIds !== undefined) {
    await setFeaturedEventIds(input.featuredEventIds, updatedBy);
  }

  const doc = await getOrCreateHomepageConfig();
  if (input.heroBanners) doc.heroBanners = input.heroBanners;
  if (input.trendingEventIds) {
    doc.trendingEventIds = input.trendingEventIds.map((id) => new mongoose.Types.ObjectId(id));
  }
  if (input.categoryVisibility) doc.categoryVisibility = input.categoryVisibility;
  doc.updatedBy = updatedBy as unknown as typeof doc.updatedBy;
  await doc.save();

  if (input.trendingEventIds?.length) {
    await Event.updateMany({ _id: { $in: input.trendingEventIds } }, { trending: true });
  }

  return doc;
}

export async function getFeaturedCurationForAdmin() {
  const doc = await getOrCreateHomepageConfig();
  const events = await orderEventsByIds(doc.featuredEventIds, {});
  return {
    featuredEventIds: doc.featuredEventIds.map((id) => id.toString()),
    events,
  };
}

export async function getTrendingCurationForAdmin() {
  const doc = await getOrCreateHomepageConfig();
  const events = await orderEventsByIds(doc.trendingEventIds, {});
  return {
    trendingEventIds: doc.trendingEventIds.map((id) => id.toString()),
    events,
  };
}

export async function getFeaturedEventsForHomepage(): Promise<PublicEventListItem[]> {
  const cached = cacheGet<PublicEventListItem[]>(FEATURED_EVENTS_CACHE_KEY);
  if (cached) return cached;

  const doc = await HomepageConfig.findOne().select("featuredEventIds").lean();
  if (!doc?.featuredEventIds?.length) return [];

  const events = await mapEventsToPublicListByIds(doc.featuredEventIds);
  cacheSet(FEATURED_EVENTS_CACHE_KEY, events, 60);
  return events;
}

export async function getTrendingEventsForHomepage(): Promise<PublicEventListItem[]> {
  const doc = await HomepageConfig.findOne().select("trendingEventIds").lean();
  if (!doc?.trendingEventIds?.length) return [];

  return mapEventsToPublicListByIds(doc.trendingEventIds);
}

export async function getPublicHomepageOverrides() {
  const doc = await HomepageConfig.findOne().lean();
  if (!doc) return null;

  const [featured, trending] = await Promise.all([
    Event.find({
      _id: { $in: doc.featuredEventIds },
      status: EventStatus.Live,
      approvalStatus: EventApprovalStatus.Approved,
    }).populate("organizer", "businessName slug logo"),
    Event.find({
      _id: { $in: doc.trendingEventIds },
      status: EventStatus.Live,
      approvalStatus: EventApprovalStatus.Approved,
    }).populate("organizer", "businessName slug logo"),
  ]);

  return { heroBanners: doc.heroBanners, featured, trending };
}
