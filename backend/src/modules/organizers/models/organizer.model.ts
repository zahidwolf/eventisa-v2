import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  OrganizerType,
  OrganizerVerificationStatus,
  type OrganizerUniversityInfo,
  type PaymentInfo,
  type SocialLinks,
} from "@/modules/organizers/types/organizer.types.js";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  OrganizationType,
  type OrganizerNotificationPreferences,
} from "@/modules/organizers/types/organizer-settings.types.js";

export interface OrganizerDocument extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  slug: string;
  phone: string;
  email: string;
  logo?: string;
  logoPublicId?: string;
  banner?: string;
  bannerPublicId?: string;
  description?: string;
  organizerType: OrganizerType;
  university?: OrganizerUniversityInfo;
  isVerified: boolean;
  followerCount: number;
  socialLinks: SocialLinks;
  paymentInfo: PaymentInfo;
  profileBio?: string;
  organizationType?: OrganizationType;
  businessAddress?: string;
  city?: string;
  establishedYear?: number;
  licenseNumber?: string;
  notificationPreferences: OrganizerNotificationPreferences;
  bankingVerified: boolean;
  verificationStatus: OrganizerVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const socialLinksSchema = new Schema<SocialLinks>(
  {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String,
    website: String,
  },
  { _id: false }
);

const notificationPreferencesSchema = new Schema<OrganizerNotificationPreferences>(
  {
    newBooking: { type: Boolean, default: true },
    bookingCancelled: { type: Boolean, default: true },
    eventApproved: { type: Boolean, default: true },
    eventRejected: { type: Boolean, default: true },
    payoutProcessed: { type: Boolean, default: true },
    payoutRejected: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: false },
  },
  { _id: false }
);

const universitySchema = new Schema<OrganizerUniversityInfo>(
  { universityName: String, department: String, clubName: String },
  { _id: false }
);

const paymentInfoSchema = new Schema<PaymentInfo>(
  {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    branchName: String,
    routingNumber: String,
    bkashNumber: String,
    nagadNumber: String,
    rocketNumber: String,
    preferredPayoutMethod: String,
  },
  { _id: false }
);

const organizerSchema = new Schema<OrganizerDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    logo: String,
    logoPublicId: String,
    banner: String,
    bannerPublicId: String,
    description: { type: String, maxlength: 2000 },
    organizerType: { type: String, enum: Object.values(OrganizerType), default: OrganizerType.EventOrganizer },
    university: { type: universitySchema, default: {} },
    isVerified: { type: Boolean, default: false },
    followerCount: { type: Number, default: 0, min: 0 },
    socialLinks: { type: socialLinksSchema, default: {} },
    paymentInfo: { type: paymentInfoSchema, default: {} },
    profileBio: { type: String, maxlength: 300 },
    organizationType: { type: String, enum: Object.values(OrganizationType) },
    businessAddress: String,
    city: String,
    establishedYear: Number,
    licenseNumber: String,
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({ ...DEFAULT_NOTIFICATION_PREFERENCES }),
    },
    bankingVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: Object.values(OrganizerVerificationStatus),
      default: OrganizerVerificationStatus.Pending,
    },
  },
  { timestamps: true }
);

export const Organizer: Model<OrganizerDocument> =
  mongoose.models.Organizer ??
  mongoose.model<OrganizerDocument>("Organizer", organizerSchema);
