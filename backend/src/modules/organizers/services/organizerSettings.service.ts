import bcrypt from "bcryptjs";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { User } from "@/modules/users/models/user.model.js";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type OrganizerNotificationPreferences,
} from "@/modules/organizers/types/organizer-settings.types.js";
import {
  applyOrganizerBanner,
  applyOrganizerLogo,
} from "@/modules/organizers/services/organizer-media.service.js";

const SALT_ROUNDS = 12;

function maskLast4(value?: string) {
  if (!value || value.length < 4) return value ? "****" : undefined;
  return `****${value.slice(-4)}`;
}

async function loadOrganizer(userId: string) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new AppError("Organizer profile not found", 404, ErrorCodes.NOT_FOUND);
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  return { organizer, user };
}

export async function getOrganizerSettings(userId: string) {
  const organizer = await Organizer.findOne({ userId })
    .select("businessName slug organizationType description logo banner businessAddress city establishedYear licenseNumber phone profileBio socialLinks notificationPreferences paymentInfo bankingVerified")
    .lean();
  if (!organizer) throw new AppError("Organizer profile not found", 404, ErrorCodes.NOT_FOUND);
  const user = await User.findById(userId).select("name phone").lean();
  if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  const pay = organizer.paymentInfo ?? {};

  return {
    profile: {
      name: user.name,
      phone: user.phone ?? organizer.phone,
      bio: organizer.profileBio ?? "",
      website: (organizer.socialLinks as Record<string, string> | undefined)?.website,
      socialLinks: organizer.socialLinks ?? {},
    },
    organization: {
      orgName: organizer.businessName,
      orgType: organizer.organizationType,
      description: organizer.description ?? "",
      logo: organizer.logo,
      coverPhoto: organizer.banner,
      address: organizer.businessAddress ?? "",
      city: organizer.city ?? "",
      establishedYear: organizer.establishedYear,
      licenseNumber: organizer.licenseNumber ?? "",
      businessName: organizer.businessName,
      slug: organizer.slug,
    },
    notifications: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...organizer.notificationPreferences,
    },
    banking: {
      preferredMethod: pay.preferredPayoutMethod,
      bankName: pay.bankName,
      accountNumber: maskLast4(pay.accountNumber as string | undefined),
      accountName: pay.accountHolderName,
      branchName: pay.branchName,
      bkashNumber: maskLast4(pay.bkashNumber as string | undefined),
      nagadNumber: maskLast4(pay.nagadNumber as string | undefined),
      rocketNumber: maskLast4(pay.rocketNumber as string | undefined),
      bankingVerified: organizer.bankingVerified,
    },
  };
}

export async function updateProfile(
  userId: string,
  input: {
    name?: string;
    phone?: string;
    bio?: string;
    socialLinks?: Record<string, string | undefined>;
  }
) {
  const { organizer, user } = await loadOrganizer(userId);

  if (input.name) user.name = input.name;
  if (input.phone) {
    user.phone = input.phone;
    organizer.phone = input.phone;
  }
  if (input.bio !== undefined) organizer.profileBio = input.bio;
  if (input.socialLinks) {
    organizer.socialLinks = { ...organizer.socialLinks, ...input.socialLinks };
  }

  await user.save();
  await organizer.save();
  return getOrganizerSettings(userId);
}

export async function updateOrganization(
  userId: string,
  input: {
    businessName?: string;
    organizationType?: string;
    description?: string;
    logo?: string;
    coverPhoto?: string;
    businessAddress?: string;
    city?: string;
    establishedYear?: number;
    licenseNumber?: string;
  }
) {
  const { organizer } = await loadOrganizer(userId);

  if (input.businessName) organizer.businessName = input.businessName;
  if (input.organizationType) organizer.organizationType = input.organizationType as never;
  if (input.description !== undefined) organizer.description = input.description;
  await applyOrganizerLogo(organizer, input.logo);
  await applyOrganizerBanner(organizer, input.coverPhoto);
  if (input.businessAddress !== undefined) organizer.businessAddress = input.businessAddress;
  if (input.city !== undefined) organizer.city = input.city;
  if (input.establishedYear !== undefined) organizer.establishedYear = input.establishedYear;
  if (input.licenseNumber !== undefined) organizer.licenseNumber = input.licenseNumber;

  await organizer.save();
  return getOrganizerSettings(userId);
}

export async function updateNotificationPreferences(
  userId: string,
  input: Partial<OrganizerNotificationPreferences>
) {
  const { organizer } = await loadOrganizer(userId);
  organizer.notificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...organizer.notificationPreferences,
    ...input,
  };
  await organizer.save();
  return getOrganizerSettings(userId);
}

export async function updateBanking(userId: string, input: Record<string, string | undefined>) {
  const { organizer } = await loadOrganizer(userId);
  const merged = { ...organizer.paymentInfo };
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") continue;
    if (value.startsWith("****")) continue;
    (merged as Record<string, string>)[key] = value;
  }
  organizer.paymentInfo = merged;
  organizer.bankingVerified = false;
  await organizer.save();
  return getOrganizerSettings(userId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await User.findById(userId).select("+password");
  if (!user?.password) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400, ErrorCodes.VALIDATION_ERROR);
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
}

export async function deleteOrganizerAccount(userId: string) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);

  const activeEvents = await Event.countDocuments({
    organizer: organizer._id,
    status: { $in: [EventStatus.Live, EventStatus.Approved, EventStatus.Pending] },
    endDate: { $gte: new Date() },
  });

  if (activeEvents > 0) {
    throw new AppError(
      "Cannot delete account while you have active or upcoming events",
      400,
      ErrorCodes.CONFLICT
    );
  }

  await Organizer.deleteOne({ _id: organizer._id });
  await User.findByIdAndDelete(userId);
}
