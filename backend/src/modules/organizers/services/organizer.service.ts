import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";
import type { OrganizerDocument } from "@/modules/organizers/models/organizer.model.js";
import type { CreateOrganizerInput } from "@/modules/organizers/validators/organizer.validator.js";
import { findUserById } from "@/modules/users/services/user.service.js";
import { User } from "@/modules/users/models/user.model.js";
import { registerAccountPendingVerification } from "@/modules/auth/services/auth.service.js";
import type { RegisterOrganizerInput } from "@/modules/organizers/validators/organizer.validator.js";

function slugifyOrganizationName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 80) || "organizer";
}

async function resolveUniqueSlug(base: string): Promise<string> {
  let slug = slugifyOrganizationName(base);
  let suffix = 0;
  while (await Organizer.findOne({ slug })) {
    suffix += 1;
    slug = `${slugifyOrganizationName(base).slice(0, 70)}-${suffix}`;
  }
  return slug;
}

/** Public signup: user account + organizer application (email verification required before login). */
export async function registerOrganizerAccount(input: RegisterOrganizerInput) {
  const email = input.email.trim().toLowerCase();
  const slug = await resolveUniqueSlug(input.organizationName);

  const reg = await registerAccountPendingVerification({
    name: input.organizationName.trim(),
    email,
    phone: input.phone.trim(),
    password: input.password,
    role: Role.User,
  });

  const organizer = await createOrganizerProfile(reg.user.id, {
    businessName: input.organizationName.trim(),
    slug,
    phone: input.phone.trim(),
    email,
  });

  return {
    email: reg.email,
    requiresVerification: true as const,
    organizer,
  };
}

export async function createOrganizerProfile(
  userId: string,
  input: CreateOrganizerInput
): Promise<OrganizerDocument> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  const existing = await Organizer.findOne({ $or: [{ userId }, { slug: input.slug }] });
  if (existing) {
    throw new AppError("Organizer profile or slug already exists", 409, ErrorCodes.CONFLICT);
  }

  const organizer = await Organizer.create({
    userId,
    ...input,
    verificationStatus: OrganizerVerificationStatus.Pending,
  });

  if (user.role === Role.User) {
    await User.findByIdAndUpdate(userId, { role: Role.Organizer });
  }

  return organizer;
}

export async function getOrganizerBySlug(slug: string) {
  const organizer = await Organizer.findOne({
    slug: slug.toLowerCase(),
    verificationStatus: OrganizerVerificationStatus.Approved,
  });
  if (!organizer) return null;

  const { Event } = await import("@/modules/events/models/event.model.js");
  const { EventStatus } = await import("@/modules/events/types/event.types.js");
  const pastEvents = await Event.find({
    organizer: organizer._id,
    status: { $in: [EventStatus.Live, EventStatus.Ended] },
  })
    .sort({ startDate: -1 })
    .limit(12)
    .select("title slug coverImage city startDate category");

  return { organizer, pastEvents };
}

export async function approveOrganizer(
  organizerId: string
): Promise<OrganizerDocument | null> {
  return Organizer.findByIdAndUpdate(
    organizerId,
    { verificationStatus: OrganizerVerificationStatus.Approved, isVerified: true },
    { new: true }
  );
}

export async function rejectOrganizer(
  organizerId: string
): Promise<OrganizerDocument | null> {
  return Organizer.findByIdAndUpdate(
    organizerId,
    { verificationStatus: OrganizerVerificationStatus.Rejected },
    { new: true }
  );
}

export interface OrganizerShowcaseItem {
  _id: string;
  name: string;
  logo?: string;
  slug: string;
  totalEvents: number;
}

export async function getOrganizerShowcase(): Promise<OrganizerShowcaseItem[]> {
  const { cacheGet, cacheSet } = await import("@/shared/cache/cache.service.js");
  const { ORGANIZER_SHOWCASE_CACHE_KEY } = await import(
    "@/modules/events/utils/event-cache.util.js"
  );
  const cached = cacheGet<OrganizerShowcaseItem[]>(ORGANIZER_SHOWCASE_CACHE_KEY);
  if (cached) return cached;

  const { EventStatus } = await import("@/modules/events/types/event.types.js");

  const rows = await Organizer.aggregate<{
    _id: mongoose.Types.ObjectId;
    name: string;
    logo?: string;
    slug: string;
    totalEvents: number;
  }>([
    { $match: { verificationStatus: OrganizerVerificationStatus.Approved } },
    {
      $lookup: {
        from: "events",
        let: { organizerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$organizer", "$$organizerId"] },
              status: EventStatus.Live,
            },
          },
          { $count: "count" },
        ],
        as: "liveEvents",
      },
    },
    {
      $addFields: {
        totalEvents: { $ifNull: [{ $arrayElemAt: ["$liveEvents.count", 0] }, 0] },
        hasLogo: {
          $and: [{ $ifNull: ["$logo", false] }, { $ne: ["$logo", ""] }],
        },
      },
    },
    {
      $match: {
        $or: [{ totalEvents: { $gt: 0 } }, { hasLogo: true }],
      },
    },
    {
      $project: {
        _id: 1,
        name: "$businessName",
        logo: 1,
        slug: 1,
        totalEvents: 1,
      },
    },
    { $sort: { totalEvents: -1, hasLogo: -1, name: 1 } },
    { $limit: 50 },
  ]);

  const organizers = rows.map((row) => ({
    _id: String(row._id),
    name: row.name,
    logo: row.logo,
    slug: row.slug,
    totalEvents: row.totalEvents,
  }));
  cacheSet(ORGANIZER_SHOWCASE_CACHE_KEY, organizers, 300);
  return organizers;
}
