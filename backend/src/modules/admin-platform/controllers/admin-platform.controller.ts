import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  approveOrganizer,
  rejectOrganizer,
  getAdminNavCounts,
  listAdminUsers,
  listAdminOrganizers,
  listAdminOrders,
  getAdminUserDetail,
  listAdminPendingOrganizersSlim,
  getAdminOrganizerDetail,
  getAdminOrderDetail,
  listPendingRefundsSlim,
} from "@/modules/admin-platform/services/admin-platform.service.js";
import { getAdminFinanceOverview } from "@/modules/admin/services/admin-finance-overview.service.js";
import { invalidateAdminCachesOnModeration } from "@/modules/admin/utils/admin-cache.util.js";

export const navCounts = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getAdminNavCounts() });
});

export const users = asyncHandler(async (req: Request, res: Response) => {
  const data = await listAdminUsers({
    search: req.query.search as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.json({ success: true, data });
});

export const userDetail = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAdminUserDetail(req.params.id as string);
  if (!data) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  res.json({ success: true, data });
});

export const organizers = asyncHandler(async (req: Request, res: Response) => {
  const data = await listAdminOrganizers({
    status: req.query.status as "all" | "pending" | "approved" | "rejected" | undefined,
    search: req.query.search as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.json({ success: true, data });
});

export const organizersPending = asyncHandler(async (_req: Request, res: Response) => {
  const organizers = await listAdminPendingOrganizersSlim();
  res.json({ success: true, data: { organizers } });
});

export const organizerDetail = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAdminOrganizerDetail(req.params.id as string);
  if (!data) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  res.json({ success: true, data });
});

export const approveOrganizerHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await approveOrganizer(req.params.id as string);
  invalidateAdminCachesOnModeration();
  if (organizer) {
    const { onOrganizerApproved } = await import("@/shared/email/emailTriggers.service.js");
    onOrganizerApproved(organizer._id.toString()).catch((err) =>
      console.error("Email trigger failed:", err)
    );
  }
  res.json({ success: true, data: { organizer }, message: "Organizer approved" });
});

export const rejectOrganizerHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await rejectOrganizer(req.params.id as string);
  invalidateAdminCachesOnModeration();
  if (organizer) {
    const { onOrganizerRejected } = await import("@/shared/email/emailTriggers.service.js");
    const reason = (req.body?.reason as string | undefined) ?? "";
    onOrganizerRejected(organizer._id.toString(), reason).catch((err) =>
      console.error("Email trigger failed:", err)
    );
  }
  res.json({ success: true, data: { organizer }, message: "Organizer rejected" });
});

export const orders = asyncHandler(async (req: Request, res: Response) => {
  const data = await listAdminOrders({
    search: req.query.search as string | undefined,
    status: req.query.status as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.json({ success: true, data });
});

export const orderDetail = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAdminOrderDetail(req.params.id as string);
  if (!data) throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  res.json({ success: true, data });
});

export const pendingRefunds = asyncHandler(async (_req: Request, res: Response) => {
  const refunds = await listPendingRefundsSlim();
  res.json({ success: true, data: { refunds } });
});

export const financeOverview = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getAdminFinanceOverview();
  res.json({ success: true, data });
});
