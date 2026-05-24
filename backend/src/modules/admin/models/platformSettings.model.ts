import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface PlatformSettingsDocument extends Document {
  singletonKey: string;
  platform: {
    name: string;
    tagline: string;
    supportEmail: string;
    supportPhone?: string;
    websiteUrl: string;
    socialLinks: { facebook?: string; instagram?: string; twitter?: string };
    maintenanceMode: boolean;
  };
  fees: {
    serviceFeePercent: number;
    minimumPayoutAmount: number;
    payoutProcessingDays: number;
    autoApprovePayoutsUnder: number;
  };
  eventControls: {
    requireApproval: boolean;
    maxSegmentsPerEvent: number;
    maxTicketsPerUserPerEvent: number;
    autoExpireEvents: boolean;
    minNoticePeriodHours: number;
    maxEventDurationDays: number;
    enabledCategories: string[];
  };
  organizerControls: {
    requireApproval: boolean;
    autoApproveVerified: boolean;
    maxActiveEventsPerOrganizer: number;
    maxFreeEventsPerMonth: number;
    useGlobalFee: boolean;
    welcomeMessage: string;
  };
  security: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    minPasswordLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
    rateLimitPerMinute: number;
    allowedOrigins: string[];
  };
  tracking: {
    metaPixelId: string;
    googleAnalyticsId: string;
    googleTagManagerId: string;
  };
  cacheLastClearedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const DEFAULT_CATEGORIES = [
  "Concert",
  "Conference",
  "Seminar",
  "Workshop",
  "Hackathon",
  "Sports",
  "Comedy",
  "Food Festival",
  "University Fest",
  "Business Summit",
  "Career Fair",
  "Club Event",
  "Cultural Event",
];

const schema = new Schema<PlatformSettingsDocument>(
  {
    singletonKey: { type: String, default: "default", unique: true },
    platform: {
      name: { type: String, default: "Eventisa" },
      tagline: { type: String, default: "Bangladesh's Premier Event Platform" },
      supportEmail: { type: String, default: "eventisa.contact@gmail.com" },
      supportPhone: String,
      websiteUrl: { type: String, default: "https://eventisa.com" },
      socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
      },
      maintenanceMode: { type: Boolean, default: false },
    },
    fees: {
      serviceFeePercent: { type: Number, default: 5, min: 0, max: 20 },
      minimumPayoutAmount: { type: Number, default: 500 },
      payoutProcessingDays: { type: Number, default: 7 },
      autoApprovePayoutsUnder: { type: Number, default: 0 },
    },
    eventControls: {
      requireApproval: { type: Boolean, default: true },
      maxSegmentsPerEvent: { type: Number, default: 10 },
      maxTicketsPerUserPerEvent: { type: Number, default: 10 },
      autoExpireEvents: { type: Boolean, default: true },
      minNoticePeriodHours: { type: Number, default: 24 },
      maxEventDurationDays: { type: Number, default: 7 },
      enabledCategories: { type: [String], default: DEFAULT_CATEGORIES },
    },
    organizerControls: {
      requireApproval: { type: Boolean, default: true },
      autoApproveVerified: { type: Boolean, default: false },
      maxActiveEventsPerOrganizer: { type: Number, default: 0 },
      maxFreeEventsPerMonth: { type: Number, default: 0 },
      useGlobalFee: { type: Boolean, default: true },
      welcomeMessage: {
        type: String,
        default: "Welcome to Eventisa! You can now create and publish events.",
      },
    },
    security: {
      accessTokenExpiry: { type: String, default: "1h" },
      refreshTokenExpiry: { type: String, default: "7d" },
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 30 },
      minPasswordLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireNumber: { type: Boolean, default: true },
      requireSpecialChar: { type: Boolean, default: false },
      rateLimitPerMinute: { type: Number, default: 100 },
      allowedOrigins: { type: [String], default: ["http://localhost:3000"] },
    },
    tracking: {
      metaPixelId: { type: String, default: "" },
      googleAnalyticsId: { type: String, default: "" },
      googleTagManagerId: { type: String, default: "" },
    },
    cacheLastClearedAt: Date,
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const PlatformSettings: Model<PlatformSettingsDocument> =
  mongoose.models.PlatformSettings ??
  mongoose.model<PlatformSettingsDocument>("PlatformSettings", schema);
