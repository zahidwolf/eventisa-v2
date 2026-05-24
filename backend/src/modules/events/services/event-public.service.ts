import mongoose from "mongoose";
import { Event } from "@/modules/events/models/event.model.js";
import type { ITicketSection } from "@/modules/events/models/ticket-section.schema.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import {
  cacheGet,
  cacheSet,
  hashQueryKey,
} from "@/shared/cache/cache.service.js";
import {
  EVENT_DETAIL_CACHE_PREFIX,
  EVENT_LIST_CACHE_PREFIX,
  invalidatePublicEventCaches,
} from "@/modules/events/utils/event-cache.util.js";

export { invalidatePublicEventCaches };

export interface PublicEventListItem {
  _id: string;
  slug: string;
  title: string;
  category: string;
  city: string;
  startDate: Date;
  endDate: Date;
  status: string;
  coverImage?: string;
  organizer: {
    _id: string;
    name: string;
    businessName: string;
    slug: string;
    logo?: string;
  };
  minPrice: number | null;
  maxPrice: number | null;
  totalCapacity: number;
  remainingCapacity: number;
  isFeatured: boolean;
  isTrending: boolean;
}

export interface PublicEventDetailSegment {
  _id?: string;
  segmentId?: string;
  title: string;
  name?: string;
  description?: string;
  price: number;
  isFree: boolean;
  remainingQuantity: number;
  capacity: number;
  quantitySold: number;
  maxPurchasePerUser: number;
  maxPurchase: number;
  minPurchase: number;
  saleStart?: Date;
  saleEnd?: Date;
  ticketColor?: string;
  status: string;
  visibility?: string;
  isVisible: boolean;
  formEnabled: boolean;
}

function computeSectionStats(sections: ITicketSection[] = []) {
  const visible = sections.filter((s) => s.isVisible !== false);
  const prices = visible.map((s) => s.price ?? 0);
  let totalCapacity = 0;
  let remainingCapacity = 0;
  for (const s of sections) {
    totalCapacity += s.capacity ?? 0;
    const sold = s.quantitySold ?? 0;
    const remaining =
      s.remainingQuantity != null
        ? s.remainingQuantity
        : Math.max(0, (s.capacity ?? 0) - sold);
    remainingCapacity += remaining;
  }
  return {
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    totalCapacity,
    remainingCapacity,
  };
}

function mapOrganizer(org: Record<string, unknown> | null | undefined) {
  if (!org || !org._id) {
    return { _id: "", name: "", businessName: "", slug: "", logo: undefined as string | undefined };
  }
  const name = String(org.businessName ?? org.name ?? "");
  return {
    _id: String(org._id),
    name,
    businessName: name,
    slug: String(org.slug ?? ""),
    logo: org.logo as string | undefined,
    banner: org.banner as string | undefined,
    description: org.description as string | undefined,
    website: org.website as string | undefined,
    socialLinks: org.socialLinks as Record<string, string> | undefined,
  };
}

function mapPublicSegment(s: ITicketSection & { _id?: mongoose.Types.ObjectId }) {
  const sold = s.quantitySold ?? 0;
  const remaining =
    s.remainingQuantity != null ? s.remainingQuantity : Math.max(0, s.capacity - sold);
  return {
    _id: s._id?.toString(),
    segmentId: s.segmentId,
    title: s.title ?? s.name ?? "",
    name: s.name ?? s.title,
    description: s.description,
    price: s.price,
    isFree: s.isFree,
    remainingQuantity: remaining,
    capacity: s.capacity,
    quantitySold: sold,
    maxPurchasePerUser: s.maxPurchasePerUser ?? s.maxPurchase,
    maxPurchase: s.maxPurchase,
    minPurchase: s.minPurchase,
    saleStart: s.saleStart,
    saleEnd: s.saleEnd,
    ticketColor: s.ticketColor,
    status: s.status,
    visibility: s.visibility,
    isVisible: s.isVisible !== false,
    formEnabled: s.formEnabled ?? false,
  };
}

export function mapEventToPublicListItem(doc: Record<string, unknown>): PublicEventListItem {
  const sections = (doc.ticketSections as ITicketSection[] | undefined) ?? [];
  const stats = computeSectionStats(sections);
  const org = mapOrganizer(doc.organizer as Record<string, unknown>);
  return {
    _id: String(doc._id),
    slug: String(doc.slug),
    title: String(doc.title),
    category: String(doc.category),
    city: String(doc.city),
    startDate: doc.startDate as Date,
    endDate: doc.endDate as Date,
    status: String(doc.status),
    coverImage: doc.coverImage as string | undefined,
    organizer: org,
    ...stats,
    isFeatured: Boolean(doc.featured),
    isTrending: Boolean(doc.trending),
  };
}

export async function aggregatePublicEventList(query: {
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}): Promise<{ events: PublicEventListItem[]; total: number }> {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 12, 50);
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = {
    status: EventStatus.Live,
    approvalStatus: EventApprovalStatus.Approved,
  };
  if (query.category) match.category = query.category;
  if (query.city) match.city = query.city;

  const [countResult, rows] = await Promise.all([
    Event.countDocuments(match),
    Event.aggregate([
      { $match: match },
      { $sort: { listingRank: -1, homepagePriority: -1, featured: -1, startDate: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "organizers",
          localField: "organizer",
          foreignField: "_id",
          as: "organizerDoc",
          pipeline: [{ $project: { businessName: 1, slug: 1, logo: 1 } }],
        },
      },
      { $unwind: { path: "$organizerDoc", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          visibleSections: {
            $filter: {
              input: { $ifNull: ["$ticketSections", []] },
              as: "s",
              cond: { $ne: ["$$s.isVisible", false] },
            },
          },
        },
      },
      {
        $addFields: {
          minPrice: { $min: "$visibleSections.price" },
          maxPrice: { $max: "$visibleSections.price" },
          totalCapacity: { $sum: "$ticketSections.capacity" },
          remainingCapacity: {
            $sum: {
              $map: {
                input: { $ifNull: ["$ticketSections", []] },
                as: "s",
                in: {
                  $max: [
                    0,
                    {
                      $subtract: [
                        "$$s.capacity",
                        { $ifNull: ["$$s.quantitySold", 0] },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          slug: 1,
          title: 1,
          category: 1,
          city: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          coverImage: 1,
          featured: 1,
          trending: 1,
          minPrice: 1,
          maxPrice: 1,
          totalCapacity: 1,
          remainingCapacity: 1,
          organizer: {
            _id: "$organizerDoc._id",
            name: "$organizerDoc.businessName",
            businessName: "$organizerDoc.businessName",
            slug: "$organizerDoc.slug",
            logo: "$organizerDoc.logo",
          },
          isFeatured: "$featured",
          isTrending: "$trending",
        },
      },
    ]),
  ]);

  const events = rows.map((row) => ({
    ...row,
    _id: String(row._id),
    organizer: {
      _id: String(row.organizer?._id ?? ""),
      name: String(row.organizer?.name ?? ""),
      businessName: String(row.organizer?.businessName ?? ""),
      slug: String(row.organizer?.slug ?? ""),
      logo: row.organizer?.logo as string | undefined,
    },
    minPrice: row.minPrice ?? null,
    maxPrice: row.maxPrice ?? null,
    isFeatured: Boolean(row.isFeatured),
    isTrending: Boolean(row.isTrending),
  })) as PublicEventListItem[];

  return { events, total: countResult };
}

export async function listPublicEventsCached(query: {
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}) {
  const cacheKey = `${EVENT_LIST_CACHE_PREFIX}${hashQueryKey(query)}`;
  const cached = cacheGet<{ events: PublicEventListItem[]; total: number }>(cacheKey);
  if (cached) return cached;

  const result = await aggregatePublicEventList(query);
  cacheSet(cacheKey, result, 60);
  return result;
}

export async function getPublicEventBySlug(slug: string) {
  const key = `${EVENT_DETAIL_CACHE_PREFIX}${slug.toLowerCase()}`;
  const cached = cacheGet<Record<string, unknown>>(key);
  if (cached) return cached;

  const doc = await Event.findOne({
    slug: slug.toLowerCase(),
    status: EventStatus.Live,
    approvalStatus: EventApprovalStatus.Approved,
  })
    .select(
      "title slug shortDescription description coverImage category city country tags venue university sponsors startDate endDate status capacity ticketSections customForm.enabled seo featured trending organizer"
    )
    .populate("organizer", "businessName slug logo banner description website socialLinks")
    .lean();

  if (!doc) return null;

  const sections = (doc.ticketSections ?? []).map((s) =>
    mapPublicSegment(s as ITicketSection & { _id?: mongoose.Types.ObjectId })
  );

  const payload = {
    _id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    city: doc.city,
    startDate: doc.startDate,
    endDate: doc.endDate,
    status: doc.status,
    shortDescription: doc.shortDescription,
    description: doc.description,
    coverImage: doc.coverImage,
    venue: doc.venue,
    university: doc.university,
    sponsors: doc.sponsors ?? [],
    organizer: mapOrganizer(doc.organizer as unknown as Record<string, unknown>),
    ticketSections: sections,
    tags: doc.tags ?? [],
    capacity: doc.capacity,
    isFeatured: doc.featured,
    isTrending: doc.trending,
    featured: doc.featured,
    trending: doc.trending,
    seo: doc.seo
      ? {
          metaTitle: doc.seo.title,
          metaDescription: doc.seo.description,
          title: doc.seo.title,
          description: doc.seo.description,
          keywords: doc.seo.keywords,
        }
      : undefined,
    customForm: doc.customForm?.enabled ? { enabled: true, fields: [] } : { enabled: false, fields: [] },
  };

  cacheSet(key, payload, 30);
  return payload;
}

/** Form fields for checkout only — not included in public event detail payload. */
export async function getPublicCheckoutFormFields(slug: string, sectionId: string) {
  const doc = await Event.findOne({
    slug: slug.toLowerCase(),
    status: EventStatus.Live,
    approvalStatus: EventApprovalStatus.Approved,
  })
    .select("customForm ticketSections")
    .lean();

  if (!doc) return null;

  const section = (doc.ticketSections ?? []).find(
    (s) => String((s as { _id?: mongoose.Types.ObjectId })._id) === sectionId
  );
  if (!section) return { globalFields: [], segmentFields: [] };

  return {
    globalFields: doc.customForm?.enabled ? (doc.customForm.fields ?? []) : [],
    segmentFields: section.formEnabled ? (section.formFields ?? []) : [],
  };
}

/** Slim list rows for homepage featured/trending curation. */
export async function mapEventsToPublicListByIds(ids: mongoose.Types.ObjectId[]) {
  if (!ids.length) return [];
  const events = await Event.find({
    _id: { $in: ids },
    status: EventStatus.Live,
    approvalStatus: EventApprovalStatus.Approved,
  })
    .select(
      "slug title category city startDate endDate status coverImage featured trending ticketSections organizer"
    )
    .populate("organizer", "businessName slug logo")
    .lean();

  const byId = new Map(events.map((e) => [String(e._id), mapEventToPublicListItem(e)]));
  return ids.map((id) => byId.get(id.toString())).filter(Boolean) as PublicEventListItem[];
}
