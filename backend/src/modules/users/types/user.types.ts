import type { Role } from "@/shared/enums/role.enum.js";
import type { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  staffRole?: AdminStaffRole;
  dateOfBirth?: Date;
  gender?: string;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  status: UserStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizerApprovalStatus = "pending" | "approved" | "rejected";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  staffRole?: AdminStaffRole;
  isVerified: boolean;
  status: UserStatus;
  organizerApprovalStatus?: OrganizerApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
}
