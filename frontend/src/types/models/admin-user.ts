import type { Role } from "@/constants/roles";

export type AdminStaffRole =
  | "super_admin"
  | "admin"
  | "moderator"
  | "support_agent"
  | "finance_manager"
  | "content_manager";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  staffRole?: AdminStaffRole;
  isVerified: boolean;
  status: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}
