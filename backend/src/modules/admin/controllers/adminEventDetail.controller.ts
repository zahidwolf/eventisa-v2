import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";
import * as detailService from "@/modules/admin/services/adminEventDetail.service.js";
import {
  onTicketCancelled,
  onTicketConfirmed,
  onTicketRefunded,
} from "@/shared/email/emailTriggers.service.js";
export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await detailService.getAdminEventOverview(req.params.eventId as string);
  res.json({ success: true, data });
});

export const header = asyncHandler(async (req: Request, res: Response) => {
  const data = await detailService.getAdminEventHeader(req.params.eventId as string);
  res.json({ success: true, data: { event: data } });
});

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const data = await detailService.getAdminEventAnalytics(req.params.eventId as string);
  res.json({ success: true, data });
});

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const data = await detailService.getEventBookings(req.params.eventId as string, {
    search: req.query.search as string | undefined,
    segmentId: req.query.segmentId as string | undefined,
    status: req.query.status as string | undefined,
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
    sort: req.query.sort as "newest" | "oldest" | "amount" | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ success: true, data });
});

export const bookingDetail = asyncHandler(async (req: Request, res: Response) => {
  const data = await detailService.getEventBookingDetail(
    req.params.eventId as string,
    req.params.orderId as string
  );
  res.json({ success: true, data });
});

export const exportBookings = asyncHandler(async (req: Request, res: Response) => {
  const format = (req.query.format as string) === "excel" ? "excel" : "csv";
  const result = await detailService.exportEventBookings(
    req.params.eventId as string,
    {
      search: req.query.search as string | undefined,
      segmentId: req.query.segmentId as string | undefined,
      status: req.query.status as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      sort: req.query.sort as "newest" | "oldest" | "amount" | undefined,
    },
    format
  );
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.body);
});

export const updateSegment = asyncHandler(async (req: Request, res: Response) => {
  const segment = await detailService.adminUpdateSegment(
    req.params.eventId as string,
    req.params.segmentId as string,
    req.body
  );
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "segment.admin_update",
    resource: "event",
    resourceId: req.params.eventId as string,
    metadata: { segmentId: req.params.segmentId, updates: req.body },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { segment } });
});

export const refundBooking = asyncHandler(async (req: Request, res: Response) => {
  const order = await detailService.adminIssueRefund(
    req.params.eventId as string,
    req.params.orderId as string,
    req.admin!.id,
    req.body.reason
  );
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "order.refund",
    resource: "order",
    resourceId: order.orderId,
    metadata: { reason: req.body.reason },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  onTicketRefunded(order._id.toString(), order.total).catch((err) =>
    console.error("Email trigger failed:", err)
  );
  res.json({ success: true, data: { order }, message: "Refund processed" });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const order = await detailService.adminCancelBooking(
    req.params.eventId as string,
    req.params.orderId as string,
    req.admin!.id,
    req.body.reason
  );
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "order.cancel",
    resource: "order",
    resourceId: order.orderId,
    metadata: { reason: req.body.reason },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  onTicketCancelled(order._id.toString(), req.body.reason).catch((err) =>
    console.error("Email trigger failed:", err)
  );
  res.json({ success: true, data: { order }, message: "Booking cancelled" });
});

export const resendEmail = asyncHandler(async (req: Request, res: Response) => {
  const data = await detailService.adminResendConfirmationEmail(
    req.params.eventId as string,
    req.params.orderId as string
  );
  onTicketConfirmed(data.orderId).catch((err) => console.error("Email trigger failed:", err));
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "order.resend_confirmation",
    resource: "order",
    resourceId: req.params.orderId as string,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data, message: "Confirmation email queued" });
});
