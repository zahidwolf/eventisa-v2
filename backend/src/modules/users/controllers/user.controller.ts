import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as dashboardService from "@/modules/users/services/user-dashboard.service.js";
import * as profileService from "@/modules/users/services/user-profile.service.js";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats(req.user!.id, req.user!.email);
  res.json({ success: true, data: stats });
});

export const listTickets = asyncHandler(async (req: Request, res: Response) => {
  const result = await dashboardService.listUserTickets(req.user!.id, req.user!.email, {
    status: req.query.status as never,
    search: req.query.search as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.json({
    success: true,
    data: { ...result, orders: result.data },
  });
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await dashboardService.listUserOrders(req.user!.id, req.user!.email, {
    status: req.query.status as never,
    search: req.query.search as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.json({
    success: true,
    data: { ...result, orders: result.data },
  });
});

export const getOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  const order = await dashboardService.getUserOrderDetail(
    req.user!.id,
    req.user!.email,
    req.params.orderId as string
  );
  res.json({ success: true, data: { order } });
});

export const getOrderTickets = asyncHandler(async (req: Request, res: Response) => {
  const tickets = await dashboardService.getUserOrderTickets(
    req.user!.id,
    req.user!.email,
    req.params.orderId as string
  );
  res.json({ success: true, data: { tickets } });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.getUserProfile(req.user!.id);
  res.json({ success: true, data: { profile } });
});

export const patchProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updateUserProfile(req.user!.id, req.body);
  res.json({ success: true, data: { profile }, message: "Profile updated" });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await profileService.changeUserPassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json({ success: true, message: "Password updated" });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await profileService.deleteUserAccount(req.user!.id, req.user!.email);
  res.json({ success: true, message: "Account deleted" });
});
