import { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";
import { Role } from "@/shared/enums/role.enum.js";

export const AdminPermission = {
  DASHBOARD: "dashboard.view",
  EVENTS_VIEW: "events.view",
  EVENTS_MODERATE: "events.moderate",
  EVENTS_FEATURE: "events.feature",
  USERS: "users.manage",
  ORGANIZERS: "organizers.manage",
  ORDERS: "orders.view",
  PAYMENTS: "payments.view",
  REFUNDS: "refunds.manage",
  ANALYTICS: "analytics.view",
  HOMEPAGE: "homepage.manage",
  SEO: "seo.manage",
  CATEGORIES: "categories.manage",
  NOTIFICATIONS: "notifications.send",
  REPORTS: "reports.view",
  AUDIT: "audit.view",
  ROLES: "roles.manage",
  SETTINGS: "settings.manage",
  SECURITY: "security.view",
} as const;

export type AdminPermissionKey = (typeof AdminPermission)[keyof typeof AdminPermission];

const ROLE_PERMISSIONS: Record<AdminStaffRole, AdminPermissionKey[]> = {
  [AdminStaffRole.SuperAdmin]: Object.values(AdminPermission),
  [AdminStaffRole.Admin]: Object.values(AdminPermission),
  [AdminStaffRole.Moderator]: [
    AdminPermission.DASHBOARD,
    AdminPermission.EVENTS_VIEW,
    AdminPermission.EVENTS_MODERATE,
    AdminPermission.ORGANIZERS,
    AdminPermission.AUDIT,
  ],
  [AdminStaffRole.SupportAgent]: [
    AdminPermission.DASHBOARD,
    AdminPermission.USERS,
    AdminPermission.ORDERS,
    AdminPermission.AUDIT,
  ],
  [AdminStaffRole.FinanceManager]: [
    AdminPermission.DASHBOARD,
    AdminPermission.PAYMENTS,
    AdminPermission.REFUNDS,
    AdminPermission.ORDERS,
    AdminPermission.ANALYTICS,
    AdminPermission.REPORTS,
  ],
  [AdminStaffRole.ContentManager]: [
    AdminPermission.DASHBOARD,
    AdminPermission.EVENTS_VIEW,
    AdminPermission.EVENTS_FEATURE,
    AdminPermission.HOMEPAGE,
    AdminPermission.SEO,
    AdminPermission.CATEGORIES,
  ],
};

export function resolveStaffRole(
  role: Role,
  staffRole?: AdminStaffRole | null
): AdminStaffRole | null {
  if (role === Role.SuperAdmin) return AdminStaffRole.SuperAdmin;
  if (role === Role.Admin && staffRole) return staffRole;
  return null;
}

export function hasPermission(
  staffRole: AdminStaffRole | null,
  permission: AdminPermissionKey
): boolean {
  if (!staffRole) return false;
  return ROLE_PERMISSIONS[staffRole]?.includes(permission) ?? false;
}

export function getPermissionsForRole(staffRole: AdminStaffRole): AdminPermissionKey[] {
  return ROLE_PERMISSIONS[staffRole] ?? [];
}

export function isPortalStaff(role: Role): boolean {
  return role === Role.Admin || role === Role.SuperAdmin;
}
