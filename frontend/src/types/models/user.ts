import type { Role } from "@/constants/roles";

export type UserStatus = "active" | "inactive" | "suspended";

export type OrganizerApprovalStatus = "pending" | "approved" | "rejected";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isVerified: boolean;
  status: UserStatus;
  organizerApprovalStatus?: OrganizerApprovalStatus;
  createdAt: string;
  updatedAt: string;
}
