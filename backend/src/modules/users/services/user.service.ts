import { User, type UserDocument } from "@/modules/users/models/user.model.js";
import type { SafeUser } from "@/modules/users/types/user.types.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { resolveStaffRole, getPermissionsForRole } from "@/shared/permissions/admin-permissions.js";

export function toSafeUser(doc: UserDocument): SafeUser {
  const staffRole = resolveStaffRole(doc.role, doc.staffRole);
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    staffRole: staffRole ?? undefined,
    isVerified: doc.isVerified,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    permissions: staffRole ? getPermissionsForRole(staffRole) : undefined,
  };
}

/** Attach organizer verification status for organizer-role users. */
export async function toSafeUserEnriched(doc: UserDocument): Promise<SafeUser> {
  const base = toSafeUser(doc);
  if (doc.role !== Role.Organizer) return base;

  const organizer = await Organizer.findOne({ userId: doc._id })
    .select("verificationStatus")
    .lean();

  if (!organizer?.verificationStatus) return base;

  return {
    ...base,
    organizerApprovalStatus: organizer.verificationStatus as SafeUser["organizerApprovalStatus"],
  };
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  return User.findOne({ email: email.toLowerCase() }).select("+password");
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  return User.findById(id);
}

export async function createUser(
  data: Pick<UserDocument, "name" | "email" | "phone" | "password" | "role"> & {
    isVerified?: boolean;
  }
): Promise<UserDocument> {
  return User.create(data);
}

export async function emailExists(email: string): Promise<boolean> {
  const count = await User.countDocuments({ email: email.toLowerCase() });
  return count > 0;
}
