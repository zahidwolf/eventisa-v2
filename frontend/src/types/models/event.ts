import type { EventSponsor, EventUniversityInfo } from "@/types/models/university";
import type { DynamicFormField, SegmentStatus, TicketSegment } from "@/lib/forms/form-field-types";

export type TicketSection = TicketSegment;
export type FormField = DynamicFormField;
export type { SegmentStatus };

export interface EventCustomForm {
  enabled: boolean;
  fields: FormField[];
}

export interface EventVenue {
  name: string;
  address?: string;
  city: string;
  country: string;
  mapUrl?: string;
}

export interface EventOrganizer {
  _id: string;
  businessName: string;
  slug: string;
  logo?: string;
  banner?: string;
}

export interface EventSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface EventMetaPixel {
  enabled?: boolean;
  pixelId?: string;
  googleAnalyticsId?: string;
}

export interface EventListItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  coverImage?: string;
  /** Wide banner for hero / listings when set */
  bannerImage?: string;
  videoThumbnail?: string;
  category: string;
  university?: EventUniversityInfo;
  sponsors?: EventSponsor[];
  city: string;
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  status?: string;
  /** Present on list endpoints; detail still returns full sections. */
  ticketSections?: TicketSection[];
  minPrice?: number | null;
  maxPrice?: number | null;
  totalCapacity?: number;
  remainingCapacity?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  organizer: EventOrganizer;
  customForm?: EventCustomForm;
  featured?: boolean;
  trending?: boolean;
  homepagePriority?: number;
  venue?: EventVenue;
  seo?: EventSeo & {
    metaTitle?: string;
    metaDescription?: string;
  };
  metaPixel?: EventMetaPixel;
}

export interface EventDetail extends EventListItem {
  description: string;
  sponsors: EventSponsor[];
  tags: string[];
  venue: EventVenue;
  capacity: number;
  status?: string;
  approvalStatus?: string;
  ticketSections: TicketSection[];
}
