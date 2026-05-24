import { Router } from "express";
import adminAuthRoutes from "@/modules/admin-auth/routes/admin-auth.routes.js";
import adminEventRoutes from "@/modules/events/routes/admin-event.routes.js";
import { adminAuthenticate } from "@/shared/middleware/auth/admin-authenticate.middleware.js";
import { requirePermission } from "@/shared/middleware/rbac/admin-permission.middleware.js";
import { AdminPermission } from "@/shared/permissions/admin-permissions.js";
import * as dashboardCtrl from "@/modules/admin-dashboard/controllers/admin-dashboard.controller.js";
import * as homepageCtrl from "@/modules/homepage/controllers/homepage-admin.controller.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  setFeaturedEventsSchema,
  setTrendingEventsSchema,
} from "@/modules/homepage/validators/homepage.validator.js";
import heroBannerAdminRoutes from "@/modules/homepage/routes/hero-banner-admin.routes.js";
import cityAdminRoutes from "@/modules/cities/routes/city-admin.routes.js";
import venueAdminRoutes from "@/modules/venues/routes/venue-admin.routes.js";
import adminAnalyticsRoutes from "@/modules/admin/routes/admin-analytics.routes.js";
import adminFinancePayoutRoutes from "@/modules/payments/routes/admin-finance-payout.routes.js";
import { listAuditLogs } from "@/modules/audit/services/audit.service.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as platformCtrl from "@/modules/admin-platform/controllers/admin-platform.controller.js";
import paymentGatewayRoutes from "@/modules/payments/routes/payment-gateway.routes.js";
import adminSettingsRoutes from "@/modules/admin/routes/admin-settings.routes.js";
import adminAdminsRoutes from "@/modules/admin/routes/admin-admins.routes.js";
import { requireSuperAdmin } from "@/shared/middleware/rbac/require-super-admin.middleware.js";
import teamMemberAdminRoutes from "@/modules/about/routes/team-member-admin.routes.js";

const router = Router();

router.use("/auth", adminAuthRoutes);

router.use(adminAuthenticate);

router.get(
  "/dashboard",
  requirePermission(AdminPermission.DASHBOARD),
  dashboardCtrl.overview
);

router.get(
  "/nav-counts",
  requirePermission(AdminPermission.DASHBOARD),
  platformCtrl.navCounts
);

router.get(
  "/users",
  requirePermission(AdminPermission.USERS),
  platformCtrl.users
);
router.get(
  "/users/:id",
  requirePermission(AdminPermission.USERS),
  platformCtrl.userDetail
);

router.get(
  "/organizers",
  requirePermission(AdminPermission.ORGANIZERS),
  platformCtrl.organizers
);
router.get(
  "/organizers/pending",
  requirePermission(AdminPermission.ORGANIZERS),
  platformCtrl.organizersPending
);
router.get(
  "/organizers/:id",
  requirePermission(AdminPermission.ORGANIZERS),
  platformCtrl.organizerDetail
);
router.patch(
  "/organizers/:id/approve",
  requirePermission(AdminPermission.ORGANIZERS),
  platformCtrl.approveOrganizerHandler
);
router.patch(
  "/organizers/:id/reject",
  requirePermission(AdminPermission.ORGANIZERS),
  platformCtrl.rejectOrganizerHandler
);

router.get(
  "/orders",
  requirePermission(AdminPermission.ORDERS),
  platformCtrl.orders
);
router.get(
  "/orders/refunds/pending",
  requirePermission(AdminPermission.REFUNDS),
  platformCtrl.pendingRefunds
);
router.get(
  "/orders/:id",
  requirePermission(AdminPermission.ORDERS),
  platformCtrl.orderDetail
);

router.get(
  "/finance/overview",
  requirePermission(AdminPermission.PAYMENTS),
  platformCtrl.financeOverview
);

router.use(
  "/payment-gateways",
  requirePermission(AdminPermission.PAYMENTS),
  paymentGatewayRoutes
);

router.use(
  "/finance/payouts",
  requirePermission(AdminPermission.PAYMENTS),
  adminFinancePayoutRoutes
);

router.use(
  "/events",
  requirePermission(AdminPermission.EVENTS_VIEW),
  adminEventRoutes
);

router.use(
  "/analytics",
  requirePermission(AdminPermission.ANALYTICS),
  adminAnalyticsRoutes
);

router.get(
  "/homepage-control",
  requirePermission(AdminPermission.HOMEPAGE),
  homepageCtrl.getConfig
);
router.patch(
  "/homepage-control",
  requirePermission(AdminPermission.HOMEPAGE),
  homepageCtrl.updateConfig
);
router.get(
  "/homepage-control/featured-events",
  requirePermission(AdminPermission.HOMEPAGE),
  homepageCtrl.getFeaturedCuration
);
router.put(
  "/homepage-control/featured-events",
  requirePermission(AdminPermission.HOMEPAGE),
  validate(setFeaturedEventsSchema),
  homepageCtrl.updateFeaturedCuration
);
router.get(
  "/homepage-control/trending-events",
  requirePermission(AdminPermission.HOMEPAGE),
  homepageCtrl.getTrendingCuration
);
router.put(
  "/homepage-control/trending-events",
  requirePermission(AdminPermission.HOMEPAGE),
  validate(setTrendingEventsSchema),
  homepageCtrl.updateTrendingCuration
);

router.use(
  "/hero-banners",
  requirePermission(AdminPermission.HOMEPAGE),
  heroBannerAdminRoutes
);

router.use("/team-members", requireSuperAdmin(), teamMemberAdminRoutes);

router.use(
  "/cities",
  requirePermission(AdminPermission.HOMEPAGE),
  cityAdminRoutes
);

router.use(
  "/venues",
  requirePermission(AdminPermission.HOMEPAGE),
  venueAdminRoutes
);

router.get(
  "/audit-logs",
  requirePermission(AdminPermission.AUDIT),
  asyncHandler(async (req, res) => {
    const data = await listAuditLogs({
      action: req.query.action as string | undefined,
      resource: req.query.resource as string | undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
    });
    res.json({ success: true, data });
  })
);

router.use("/settings", adminSettingsRoutes);
router.use("/admins", adminAdminsRoutes);

export default router;
