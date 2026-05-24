import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as settingsService from "@/modules/organizers/services/organizerSettings.service.js";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.getOrganizerSettings(req.user!.id);
  res.json({ success: true, data });
});

export const patchProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.updateProfile(req.user!.id, req.body);
  res.json({ success: true, data, message: "Profile updated" });
});

export const patchOrganization = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.updateOrganization(req.user!.id, req.body);
  res.json({ success: true, data, message: "Organization updated" });
});

export const patchNotifications = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.updateNotificationPreferences(req.user!.id, req.body);
  res.json({ success: true, data, message: "Notification preferences saved" });
});

export const patchBanking = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.updateBanking(req.user!.id, req.body);
  res.json({ success: true, data, message: "Banking details saved" });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json({ success: true, message: "Password updated" });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.deleteOrganizerAccount(req.user!.id);
  res.json({ success: true, message: "Account deleted" });
});
