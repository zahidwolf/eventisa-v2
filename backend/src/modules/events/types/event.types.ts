export enum EventStatus {
  Draft = "draft",
  Pending = "pending",
  Approved = "approved",
  Live = "live",
  Rejected = "rejected",
  Ended = "ended",
}

export enum EventApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface EventVenue {
  name: string;
  address?: string;
  city: string;
  country: string;
  mapUrl?: string;
}

export interface EventSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface EventMetaPixel {
  pixelId?: string;
  googleAnalyticsId?: string;
  enabled: boolean;
}
