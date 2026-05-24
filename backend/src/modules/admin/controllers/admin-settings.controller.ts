import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { getAdminSettingsSlim } from "@/modules/admin/services/admin-settings-read.service.js";
import {
  patchPlatformSettings,
  patchFeeSettings,
  patchEventControlSettings,
  patchOrganizerControlSettings,
  patchSecuritySettings,
  clearPlatformCache,
  patchTrackingSettings,
} from "@/modules/admin/services/platformSettings.service.js";
import { invalidatePublicTrackingCache } from "@/modules/admin/services/tracking-config.service.js";
import { getSystemHealth } from "@/modules/admin/services/system-health.service.js";
import {
  listAdminUsers,
  inviteAdmin,
  deactivateAdmin,
  changeAdminRole,
  resetAdminPassword,
} from "@/modules/admin/services/admin-management.service.js";
import { listAdminActivity, logAdminActivity } from "@/shared/adminActivity.service.js";

function actor(req: Request) {
  return { id: req.admin!.id, name: req.admin!.email.split("@")[0], email: req.admin!.email };
}

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getAdminSettingsSlim();
  res.json({ success: true, data: { settings } });
});

export const patchPlatform = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  if (body.maintenanceMode === true && body.maintenanceConfirm !== "CONFIRM") {
    throw new AppError(
      'Type "CONFIRM" to enable maintenance mode',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const { maintenanceConfirm: _c, ...platform } = body;
  void _c;
  const settings = await patchPlatformSettings(platform, req.admin!.id);

  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "settings.update",
    targetType: "settings",
    targetName: "platform",
    meta: platform,
  });

  res.json({ success: true, data: { settings }, message: "Platform settings saved" });
});

export const patchFees = asyncHandler(async (req: Request, res: Response) => {
  const settings = await patchFeeSettings(req.body, req.admin!.id);
  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "settings.update",
    targetType: "settings",
    targetName: "fees",
  });
  res.json({ success: true, data: { settings }, message: "Fee settings saved" });
});

export const patchEvents = asyncHandler(async (req: Request, res: Response) => {
  const settings = await patchEventControlSettings(req.body, req.admin!.id);
  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "settings.update",
    targetType: "settings",
    targetName: "events",
  });
  res.json({ success: true, data: { settings }, message: "Event controls saved" });
});

export const patchOrganizers = asyncHandler(async (req: Request, res: Response) => {
  const settings = await patchOrganizerControlSettings(req.body, req.admin!.id);
  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "settings.update",
    targetType: "settings",
    targetName: "organizers",
  });
  res.json({ success: true, data: { settings }, message: "Organizer controls saved" });
});

export const patchSecurity = asyncHandler(async (req: Request, res: Response) => {
  const settings = await patchSecuritySettings(req.body, req.admin!.id);
  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "settings.update",
    targetType: "settings",
    targetName: "security",
  });
  res.json({ success: true, data: { settings }, message: "Security settings saved" });
});

export const patchTracking = asyncHandler(async (req: Request, res: Response) => {
  const settings = await patchTrackingSettings(req.body, req.admin!.id);
  invalidatePublicTrackingCache();
  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "settings.update",
    targetType: "settings",
    targetName: "tracking",
  });
  res.json({ success: true, data: { settings }, message: "Tracking settings saved" });
});

export const systemHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = await getSystemHealth();
  res.json({ success: true, data: health });
});

export const clearCache = asyncHandler(async (req: Request, res: Response) => {
  const clearedAt = await clearPlatformCache(req.admin!.id);
  res.json({ success: true, data: { clearedAt }, message: "Cache cleared" });
});

export const activityLog = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 50;
  const logs = await listAdminActivity(limit);
  res.json({ success: true, data: { logs } });
});

export const listAdmins = asyncHandler(async (_req: Request, res: Response) => {
  const admins = await listAdminUsers();
  res.json({ success: true, data: { admins } });
});

export const inviteAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const admin = await inviteAdmin({
    ...req.body,
    invitedBy: actor(req),
  });
  res.status(201).json({ success: true, data: { admin }, message: "Admin invited" });
});

export const deactivateAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await deactivateAdmin(req.params.id as string, req.admin!.id, req.admin!.email);
  res.json({ success: true, data, message: "Admin deactivated" });
});

export const changeRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await changeAdminRole(
    req.params.id as string,
    req.body.role,
    req.admin!.id,
    req.admin!.email
  );
  res.json({ success: true, data, message: "Admin role updated" });
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await resetAdminPassword(req.params.id as string, req.admin!.id, req.admin!.email);
  res.json({ success: true, message: "Password reset email sent" });
});
