export enum Role {
  Guest = "guest",
  User = "user",
  Organizer = "organizer",
  Admin = "admin",
  SuperAdmin = "super_admin",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.Guest]: 0,
  [Role.User]: 1,
  [Role.Organizer]: 2,
  [Role.Admin]: 3,
  [Role.SuperAdmin]: 4,
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Guest]: "Guest",
  [Role.User]: "User",
  [Role.Organizer]: "Organizer",
  [Role.Admin]: "Admin",
  [Role.SuperAdmin]: "Super Admin",
};
