export interface PlatformSettings {
  _id: string;
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
  cacheLastClearedAt?: string;
}

export interface AdminStaffRow {
  id: string;
  name: string;
  email: string;
  role: string;
  staffRole: string;
  status: string;
  joinedAt: string;
  lastLoginAt: string | null;
}

export interface AdminActivityRow {
  _id: string;
  adminName: string;
  action: string;
  targetName?: string;
  targetType?: string;
  createdAt: string;
}

export interface SystemHealth {
  database: { status: string; databaseName: string; collectionsCount: number };
  email: { status: string; from: string | null };
  cloudinary: { status: string; cloudName: string | null; provider: string };
  payments: { activeCount: number; defaultGateway: string | null };
  stats: Record<string, number | null>;
  cacheLastClearedAt: string | null;
}

export type SettingsTab =
  | "platform"
  | "admins"
  | "fees"
  | "events"
  | "organizers"
  | "security"
  | "system";
