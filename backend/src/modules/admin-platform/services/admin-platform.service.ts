import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { Payout } from "@/modules/payments/models/payout.model.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";
import { PayoutStatus } from "@/modules/payments/types/payout.types.js";
import { cacheGet, cacheSet } from "@/shared/cache/cache.service.js";
import {
  ADMIN_NAV_COUNTS_KEY,
  invalidateAdminNavCountsCache,
} from "@/modules/admin/utils/admin-cache.util.js";
import {
  approveOrganizer,
  rejectOrganizer,
} from "@/modules/organizers/services/organizer.service.js";
import { listAdminUsersSlim, getAdminUserDetail } from "@/modules/admin/services/admin-user-read.service.js";
import {
  listAdminOrganizersSlim,
  listAdminPendingOrganizersSlim,
  getAdminOrganizerDetail,
} from "@/modules/admin/services/admin-organizer-read.service.js";
import {
  listAdminOrdersSlim,
  getAdminOrderDetail,
  listPendingRefundsSlim,
} from "@/modules/admin/services/admin-order-read.service.js";

export { invalidateAdminNavCountsCache };

export async function getAdminNavCounts() {
  const cached = cacheGet<{
    pendingEvents: number;
    pendingOrganizers: number;
    pendingRefunds: number;
    pendingPayouts: number;
  }>(ADMIN_NAV_COUNTS_KEY);
  if (cached) return cached;

  const [pendingEvents, pendingOrganizers, pendingRefunds, pendingPayouts] =
    await Promise.all([
      Event.countDocuments({
        $or: [
          { approvalStatus: EventApprovalStatus.Pending },
          { status: EventStatus.Pending },
        ],
      }),
      Organizer.countDocuments({
        verificationStatus: OrganizerVerificationStatus.Pending,
      }),
      Order.countDocuments({ paymentStatus: PaymentStatus.Refunded }),
      Payout.countDocuments({
        status: { $in: [PayoutStatus.Pending, PayoutStatus.Approved] },
      }),
    ]);

  const counts = { pendingEvents, pendingOrganizers, pendingRefunds, pendingPayouts };
  cacheSet(ADMIN_NAV_COUNTS_KEY, counts, 60);
  return counts;
}

export async function listAdminUsers(query: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return listAdminUsersSlim(query);
}

export async function listAdminOrganizers(query: {
  status?: "all" | "pending" | "approved" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
}) {
  return listAdminOrganizersSlim(query);
}

export async function listAdminOrders(query: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return listAdminOrdersSlim(query);
}

export { getAdminUserDetail, listAdminPendingOrganizersSlim, getAdminOrganizerDetail };
export { getAdminOrderDetail, listPendingRefundsSlim };
export { approveOrganizer, rejectOrganizer };

export { buildActivityFeed } from "@/modules/admin-platform/services/admin-platform-activity.service.js";
