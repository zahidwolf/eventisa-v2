import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { requirePermission } from "@/shared/middleware/rbac/admin-permission.middleware.js";
import { AdminPermission } from "@/shared/permissions/admin-permissions.js";
import { adminUserBridge } from "@/modules/admin/middleware/admin-user-bridge.middleware.js";
import {
  adminBookingActionSchema,
  adminSegmentUpdateSchema,
} from "@/modules/admin/validators/admin-event-detail.validator.js";
import * as detailController from "@/modules/admin/controllers/adminEventDetail.controller.js";
import * as attendeeController from "@/modules/events/controllers/attendeeData.controller.js";
import * as checkInController from "@/modules/events/controllers/checkIn.controller.js";
import * as promoCodeController from "@/modules/events/controllers/promoCode.controller.js";
import {
  bulkSyncSchema,
  checkInLogQuerySchema,
  manualCheckInSchema,
  scanCheckInSchema,
  searchCheckInQuerySchema,
} from "@/modules/events/validators/checkIn.validator.js";
import {
  createPromoCodeSchema,
  updatePromoCodeSchema,
} from "@/modules/events/validators/promoCode.validator.js";
import { assignGatewaySchema } from "@/modules/payments/validators/payment-gateway.validator.js";
import * as gatewayController from "@/modules/payments/controllers/payment-gateway.controller.js";

const router = Router({ mergeParams: true });
const bridge = [adminUserBridge];

router.get("/overview", requirePermission(AdminPermission.EVENTS_VIEW), detailController.overview);
router.get(
  "/gateway-assignment",
  requirePermission(AdminPermission.EVENTS_VIEW),
  gatewayController.eventAssignment
);
router.patch(
  "/assign-gateway",
  requirePermission(AdminPermission.PAYMENTS),
  validate(assignGatewaySchema),
  gatewayController.assignToEvent
);
router.patch(
  "/remove-gateway",
  requirePermission(AdminPermission.PAYMENTS),
  gatewayController.removeFromEvent
);
router.get("/header", requirePermission(AdminPermission.EVENTS_VIEW), detailController.header);
router.get("/analytics", requirePermission(AdminPermission.EVENTS_VIEW), detailController.analytics);

router.get(
  "/bookings/export",
  requirePermission(AdminPermission.ORDERS),
  detailController.exportBookings
);
router.get(
  "/bookings/:orderId",
  requirePermission(AdminPermission.ORDERS),
  detailController.bookingDetail
);
router.get("/bookings", requirePermission(AdminPermission.ORDERS), detailController.listBookings);

router.post(
  "/bookings/:orderId/refund",
  requirePermission(AdminPermission.REFUNDS),
  validate(adminBookingActionSchema),
  detailController.refundBooking
);
router.post(
  "/bookings/:orderId/cancel",
  requirePermission(AdminPermission.ORDERS),
  validate(adminBookingActionSchema),
  detailController.cancelBooking
);
router.post(
  "/bookings/:orderId/resend-email",
  requirePermission(AdminPermission.ORDERS),
  detailController.resendEmail
);

router.patch(
  "/segments/:segmentId/admin-update",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  validate(adminSegmentUpdateSchema),
  detailController.updateSegment
);

router.get("/attendees", requirePermission(AdminPermission.EVENTS_VIEW), bridge, attendeeController.list);
router.get(
  "/attendees/export",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  attendeeController.exportAttendees
);
router.get(
  "/attendees/submission/:submissionId",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  attendeeController.getOne
);

router.get(
  "/checkin/search",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  validate(searchCheckInQuerySchema, "query"),
  checkInController.search
);
router.post(
  "/checkin/manual",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  validate(manualCheckInSchema),
  checkInController.manual
);
router.post(
  "/checkin/scan",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  validate(scanCheckInSchema),
  checkInController.scan
);
router.post(
  "/checkin/sync",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  validate(bulkSyncSchema),
  checkInController.sync
);
router.get("/checkin/stats", requirePermission(AdminPermission.EVENTS_VIEW), bridge, checkInController.stats);
router.get(
  "/checkin/log",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  validate(checkInLogQuerySchema),
  checkInController.log
);

router.get("/promo-codes", requirePermission(AdminPermission.EVENTS_VIEW), bridge, promoCodeController.list);
router.post(
  "/promo-codes",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  bridge,
  validate(createPromoCodeSchema),
  promoCodeController.create
);
router.get(
  "/promo-codes/:codeId/stats",
  requirePermission(AdminPermission.EVENTS_VIEW),
  bridge,
  promoCodeController.stats
);
router.patch(
  "/promo-codes/:codeId",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  bridge,
  validate(updatePromoCodeSchema),
  promoCodeController.update
);
router.delete(
  "/promo-codes/:codeId",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  bridge,
  promoCodeController.remove
);

export default router;
