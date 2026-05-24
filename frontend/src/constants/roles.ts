export const ROLES = {
  GUEST: "guest",
  USER: "user",
  ORGANIZER: "organizer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.GUEST]: 0,
  [ROLES.USER]: 1,
  [ROLES.ORGANIZER]: 2,
  [ROLES.ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4,
};

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.GUEST]: "Guest",
  [ROLES.USER]: "User",
  [ROLES.ORGANIZER]: "Organizer",
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUPER_ADMIN]: "Super Admin",
};
