import type { EventListItem } from "@/types/models/event";

export type OrganizerType =
  | "event_organizer"
  | "company"
  | "brand"
  | "agency"
  | "corporate"
  | "university"
  | "club"
  | "community"
  | "ngo";

export interface OrganizerProfile {
  _id: string;
  businessName: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  organizerType?: OrganizerType;
  university?: { universityName?: string; department?: string; clubName?: string };
  isVerified?: boolean;
  followerCount?: number;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface OrganizerPublicProfile {
  organizer: OrganizerProfile;
  pastEvents: Pick<EventListItem, "title" | "slug" | "coverImage" | "city" | "startDate" | "category">[];
}
