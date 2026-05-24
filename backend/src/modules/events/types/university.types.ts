export enum UniversityEventType {
  UniversityFest = "University Fest",
  ClubEvent = "Club Event",
  Seminar = "Seminar",
  Workshop = "Workshop",
  Hackathon = "Hackathon",
  CareerFair = "Career Fair",
  Competition = "Competition",
  SportsTournament = "Sports Tournament",
  Concert = "Concert",
  DepartmentEvent = "Department Event",
}

export enum SponsorTier {
  Title = "title",
  Gold = "gold",
  Silver = "silver",
  Community = "community",
}

export interface EventUniversityInfo {
  eventType?: string;
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
  name: string;
  logo: string;
  tier: SponsorTier;
  websiteUrl?: string;
  order?: number;
}
