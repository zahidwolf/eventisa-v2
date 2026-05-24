export enum OrganizationType {
  Individual = "individual",
  Company = "company",
  Ngo = "ngo",
  UniversityClub = "university_club",
  Government = "government",
  Other = "other",
}

export enum PayoutMethod {
  BankTransfer = "bank_transfer",
  Bkash = "bkash",
  Nagad = "nagad",
  Rocket = "rocket",
}

export interface OrganizerNotificationPreferences {
  newBooking: boolean;
  bookingCancelled: boolean;
  eventApproved: boolean;
  eventRejected: boolean;
  payoutProcessed: boolean;
  payoutRejected: boolean;
  weeklySummary: boolean;
  dailyDigest: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: OrganizerNotificationPreferences = {
  newBooking: true,
  bookingCancelled: true,
  eventApproved: true,
  eventRejected: true,
  payoutProcessed: true,
  payoutRejected: true,
  weeklySummary: true,
  dailyDigest: false,
};

export interface ExtendedSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
}

export interface ExtendedPaymentInfo {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  routingNumber?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  preferredPayoutMethod?: PayoutMethod;
}
