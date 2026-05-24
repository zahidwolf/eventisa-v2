export type UniversityEventType =
  | "University Fest"
  | "Club Event"
  | "Seminar"
  | "Workshop"
  | "Hackathon"
  | "Career Fair"
  | "Competition"
  | "Sports Tournament"
  | "Concert"
  | "Department Event";

export type SponsorTier = "title" | "gold" | "silver" | "community";

export interface EventUniversityInfo {
  eventType?: UniversityEventType | string;
  universityName?: string;
  department?: string;
  clubName?: string;
  batch?: string;
  session?: string;
  studentOnly?: boolean;
  requiresStudentId?: boolean;
  allowedEmailDomains?: string[];
}

export interface EventSponsor {
  _id?: string;
  name: string;
  logo: string;
  tier: SponsorTier;
  websiteUrl?: string;
  order?: number;
}

export const UNIVERSITY_EVENT_TYPES: UniversityEventType[] = [
  "University Fest",
  "Club Event",
  "Seminar",
  "Workshop",
  "Hackathon",
  "Career Fair",
  "Competition",
  "Sports Tournament",
  "Concert",
  "Department Event",
];
