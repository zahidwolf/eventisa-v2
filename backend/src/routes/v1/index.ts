import { Router } from "express";
import authRoutes from "@/modules/auth/routes/auth.routes.js";
import organizerRoutes from "@/modules/organizers/routes/organizer.routes.js";
import organizerPublicRoutes from "@/modules/organizers/routes/organizer.public.routes.js";
import homepagePublicRoutes from "@/modules/homepage/routes/homepage.public.routes.js";
import heroBannerPublicRoutes from "@/modules/homepage/routes/hero-banner.public.routes.js";
import teamMemberPublicRoutes from "@/modules/about/routes/team-member.public.routes.js";
import cityPublicRoutes from "@/modules/cities/routes/city-public.routes.js";
import venuePublicRoutes from "@/modules/venues/routes/venue-public.routes.js";
import eventRoutes from "@/modules/events/routes/event.routes.js";
import organizerEventRoutes from "@/modules/events/routes/organizer-event.routes.js";
import adminRoutes from "@/routes/v1/admin.routes.js";
import orderRoutes from "@/modules/orders/routes/order.routes.js";
import ticketRoutes from "@/modules/tickets/routes/ticket.routes.js";
import checkoutRoutes from "@/modules/checkout/routes/checkout.routes.js";
import paymentRoutes from "@/modules/payments/routes/payment.routes.js";
import uploadRoutes from "@/modules/uploads/routes/upload.routes.js";
import checkinRoutes from "@/modules/checkin/routes/checkin.routes.js";
import analyticsRoutes from "@/modules/analytics/routes/analytics.routes.js";
import userRoutes from "@/modules/users/routes/user.routes.js";
import organizerPayoutRoutes from "@/modules/payments/routes/organizer-payout.routes.js";
import { maintenanceModeGuard } from "@/shared/middleware/maintenance/maintenance-mode.middleware.js";
import { getPublicPlatformStatus } from "@/modules/admin/services/platformSettings.service.js";
import { getPublicTrackingConfig } from "@/modules/admin/services/tracking-config.service.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";

const router = Router();

router.get(
  "/public/platform-status",
  asyncHandler(async (_req, res) => {
    const status = await getPublicPlatformStatus();
    res.json({ success: true, data: status });
  })
);

router.get(
  "/public/tracking-config",
  asyncHandler(async (_req, res) => {
    const config = await getPublicTrackingConfig();
    res.set("Cache-Control", "public, max-age=300");
    res.json({ success: true, data: config });
  })
);

router.use(maintenanceModeGuard);

router.use("/auth", authRoutes);
router.use("/organizers", organizerRoutes);
router.use("/organizer", organizerRoutes);
router.use("/public/organizers", organizerPublicRoutes);
router.use("/public/homepage", homepagePublicRoutes);
router.use("/public/hero-banners", heroBannerPublicRoutes);
router.use("/public/team-members", teamMemberPublicRoutes);
router.use("/public/cities", cityPublicRoutes);
router.use("/public/venues", venuePublicRoutes);
router.use("/events", eventRoutes);
router.use("/organizer/events", organizerEventRoutes);
router.use("/organizer/payouts", organizerPayoutRoutes);
router.use("/admin", adminRoutes);
router.use("/orders", orderRoutes);
router.use("/tickets", ticketRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/payments", paymentRoutes);
router.use("/uploads", uploadRoutes);
router.use("/organizer/checkin", checkinRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/user", userRoutes);

router.post("/events/submit-for-review/:id", (_req, res) => {
  res.status(301).json({
    success: false,
    message: "Use POST /api/organizer/events/:id/submit-for-review",
  });
});

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Eventisa API is running" });
});

export default router;
