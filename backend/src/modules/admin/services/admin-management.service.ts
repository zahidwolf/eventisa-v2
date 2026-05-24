import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "@/modules/users/models/user.model.js";
import { Role } from "@/shared/enums/role.enum.js";
import { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";
import { UserStatus } from "@/modules/users/types/user.types.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { sendEmail } from "@/shared/email/email.service.js";
import { emailLayout } from "@/shared/email/email-layout.js";
import { env } from "@/config/env.js";
import { logAdminActivity } from "@/shared/adminActivity.service.js";

function randomPassword(length = 14): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

export async function listAdminUsers() {
  const users = await User.find({
    role: { $in: [Role.Admin, Role.SuperAdmin] },
  })
    .select("name email role staffRole status createdAt lastLoginAt mustChangePassword")
    .sort({ createdAt: -1 })
    .lean();

  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    staffRole: u.staffRole ?? (u.role === Role.SuperAdmin ? AdminStaffRole.SuperAdmin : AdminStaffRole.Admin),
    status: u.status,
    joinedAt: u.createdAt,
    lastLoginAt: u.lastLoginAt ?? null,
    mustChangePassword: u.mustChangePassword ?? false,
  }));
}

export async function inviteAdmin(input: {
  name: string;
  email: string;
  role: "admin" | "super_admin";
  invitedBy: { id: string; name: string; email: string };
}) {
  const email = input.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("A user with this email already exists", 409, ErrorCodes.CONFLICT);
  }

  const password = randomPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  const isSuper = input.role === "super_admin";

  const user = await User.create({
    name: input.name.trim(),
    email,
    password: passwordHash,
    role: isSuper ? Role.SuperAdmin : Role.Admin,
    staffRole: isSuper ? AdminStaffRole.SuperAdmin : AdminStaffRole.Admin,
    isVerified: true,
    status: UserStatus.Active,
    mustChangePassword: true,
  });

  const loginUrl = `${env.CLIENT_URL}/admin/login`;
  const html = emailLayout(`
    <p style="color:#94a3b8;margin:0 0 16px;">Hi ${input.name},</p>
    <p style="color:#94a3b8;margin:0 0 16px;">You've been invited as an Eventisa ${isSuper ? "Super Admin" : "Admin"}.</p>
    <p style="color:#e2e8f0;margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
    <p style="color:#e2e8f0;margin:0 0 16px;"><strong>Temporary password:</strong> ${password}</p>
    <p style="color:#94a3b8;margin:0 0 20px;">Sign in at <a href="${loginUrl}" style="color:#ec4899;">${loginUrl}</a> and change your password after first login.</p>
  `);

  void sendEmail(email, "You're invited to Eventisa Admin", html);

  await logAdminActivity({
    adminId: input.invitedBy.id,
    adminName: input.invitedBy.name,
    action: "admin.invite",
    targetType: "admin",
    targetId: user._id.toString(),
    targetName: user.name,
    meta: { email, role: input.role },
  });

  return { id: user._id.toString(), email: user.email, name: user.name };
}

export async function deactivateAdmin(adminId: string, actorId: string, actorName: string) {
  if (adminId === actorId) {
    throw new AppError("You cannot deactivate your own account", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const user = await User.findById(adminId);
  if (!user || (user.role !== Role.Admin && user.role !== Role.SuperAdmin)) {
    throw new AppError("Admin not found", 404, ErrorCodes.NOT_FOUND);
  }

  user.status = UserStatus.Suspended;
  await user.save();

  await logAdminActivity({
    adminId: actorId,
    adminName: actorName,
    action: "admin.deactivate",
    targetType: "admin",
    targetId: adminId,
    targetName: user.name,
  });

  return { id: adminId, status: user.status };
}

export async function changeAdminRole(
  adminId: string,
  role: "admin" | "super_admin",
  actorId: string,
  actorName: string
) {
  if (adminId === actorId) {
    throw new AppError("You cannot change your own role", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const user = await User.findById(adminId);
  if (!user || (user.role !== Role.Admin && user.role !== Role.SuperAdmin)) {
    throw new AppError("Admin not found", 404, ErrorCodes.NOT_FOUND);
  }

  const isSuper = role === "super_admin";
  user.role = isSuper ? Role.SuperAdmin : Role.Admin;
  user.staffRole = isSuper ? AdminStaffRole.SuperAdmin : AdminStaffRole.Admin;
  await user.save();

  await logAdminActivity({
    adminId: actorId,
    adminName: actorName,
    action: "admin.role_change",
    targetType: "admin",
    targetId: adminId,
    targetName: user.name,
    meta: { role },
  });

  return { id: adminId, role: user.role, staffRole: user.staffRole };
}

export async function resetAdminPassword(adminId: string, actorId: string, actorName: string) {
  const user = await User.findById(adminId).select("+password");
  if (!user || (user.role !== Role.Admin && user.role !== Role.SuperAdmin)) {
    throw new AppError("Admin not found", 404, ErrorCodes.NOT_FOUND);
  }

  const password = randomPassword();
  user.password = await bcrypt.hash(password, 12);
  user.mustChangePassword = true;
  await user.save();

  const loginUrl = `${env.CLIENT_URL}/admin/login`;
  const html = emailLayout(`
    <p style="color:#94a3b8;margin:0 0 16px;">Hi ${user.name},</p>
    <p style="color:#94a3b8;margin:0 0 16px;">Your Eventisa admin password was reset.</p>
    <p style="color:#e2e8f0;margin:0 0 8px;"><strong>New temporary password:</strong> ${password}</p>
    <p style="color:#94a3b8;margin:0;">Sign in at <a href="${loginUrl}" style="color:#ec4899;">${loginUrl}</a></p>
  `);

  void sendEmail(user.email, "Your Eventisa admin password was reset", html);

  await logAdminActivity({
    adminId: actorId,
    adminName: actorName,
    action: "admin.password_reset",
    targetType: "admin",
    targetId: adminId,
    targetName: user.name,
  });

  return { success: true };
}
