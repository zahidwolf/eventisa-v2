export enum OrganizerType {
  EventOrganizer = "event_organizer",
  Company = "company",
  Brand = "brand",
  Agency = "agency",
  Corporate = "corporate",
  University = "university",
  Club = "club",
  Community = "community",
  Ngo = "ngo",
}

export enum OrganizerVerificationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
}

export interface OrganizerUniversityInfo {
  universityName?: string;
  department?: string;
  clubName?: string;
}

export interface PaymentInfo {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  routingNumber?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  preferredPayoutMethod?: string;
}
