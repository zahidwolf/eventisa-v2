export enum AdminStaffRole {
  SuperAdmin = "super_admin",
  Admin = "admin",
  Moderator = "moderator",
  SupportAgent = "support_agent",
  FinanceManager = "finance_manager",
  ContentManager = "content_manager",
}

export const ADMIN_STAFF_LABELS: Record<AdminStaffRole, string> = {
  [AdminStaffRole.SuperAdmin]: "Super Admin",
  [AdminStaffRole.Admin]: "Admin",
  [AdminStaffRole.Moderator]: "Moderator",
  [AdminStaffRole.SupportAgent]: "Support Agent",
  [AdminStaffRole.FinanceManager]: "Finance Manager",
  [AdminStaffRole.ContentManager]: "Content Manager",
};
