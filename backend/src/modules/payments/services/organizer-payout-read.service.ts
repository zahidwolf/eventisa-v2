import mongoose from "mongoose";
import { Order } from "@/modules/orders/models/order.model.js";
import { Payout } from "@/modules/payments/models/payout.model.js";
import { PayoutStatus } from "@/modules/payments/types/payout.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { getServiceFeeRate } from "@/modules/admin/services/platformSettings.service.js";
import { cacheGet, cacheSet } from "@/shared/cache/cache.service.js";
import {
  getLockedEventIds,
  payoutableEventFilter,
} from "@/modules/payments/services/payout.helpers.js";
import { Event } from "@/modules/events/models/event.model.js";
import {
  invalidateOrganizerPayoutSummaryCache,
  organizerPayoutSummaryCacheKey,
} from "@/modules/organizers/utils/organizer-cache.util.js";

export { invalidateOrganizerPayoutSummaryCache };

export interface OrganizerPayoutSummarySlim {
  totalGrossEarned: number;
  totalPlatformFees: number;
  totalNetEarned: number;
  totalPaidOut: number;
  pendingPayout: number;
  availableForPayout: number;
}

export async function getOrganizerPayoutSummaryCached(
  organizerId: mongoose.Types.ObjectId
): Promise<OrganizerPayoutSummarySlim> {
  const key = organizerPayoutSummaryCacheKey(organizerId.toString());
  const cached = cacheGet<OrganizerPayoutSummarySlim>(key);
  if (cached) return cached;

  const feeRate = await getServiceFeeRate();
  const [orderRow, payoutRows, payoutableNet] = await Promise.all([
    Order.aggregate<{ gross: number }>([
      { $match: { organizerId, paymentStatus: PaymentStatus.Paid } },
      { $group: { _id: null, gross: { $sum: "$total" } } },
    ]),
    Payout.aggregate<{ _id: string; amount: number }>([
      { $match: { organizerId } },
      { $group: { _id: "$status", amount: { $sum: "$netAmount" } } },
    ]),
    aggregateAvailablePayoutNet(organizerId, feeRate),
  ]);

  const gross = orderRow[0]?.gross ?? 0;
  const totalPlatformFees = Math.round(gross * feeRate);
  const totalNetEarned = gross - totalPlatformFees;

  let totalPaidOut = 0;
  let pendingPayout = 0;
  for (const row of payoutRows) {
    if (row._id === PayoutStatus.Paid) totalPaidOut += row.amount;
    if (row._id === PayoutStatus.Pending || row._id === PayoutStatus.Approved) {
      pendingPayout += row.amount;
    }
  }

  const summary: OrganizerPayoutSummarySlim = {
    totalGrossEarned: gross,
    totalPlatformFees,
    totalNetEarned,
    totalPaidOut,
    pendingPayout,
    availableForPayout: payoutableNet,
  };

  cacheSet(key, summary, 120);
  return summary;
}

async function aggregateAvailablePayoutNet(
  organizerId: mongoose.Types.ObjectId,
  feeRate: number
) {
  const events = await Event.find(payoutableEventFilter(organizerId))
    .select("_id")
    .lean();
  if (!events.length) return 0;

  const eventIds = events.map((e) => e._id);
  const locked = await getLockedEventIds(organizerId);
  const eligibleIds = eventIds.filter((id) => !locked.has(id.toString()));
  if (!eligibleIds.length) return 0;

  const rows = await Order.aggregate<{ gross: number }>([
    {
      $match: {
        eventId: { $in: eligibleIds },
        paymentStatus: PaymentStatus.Paid,
      },
    },
    { $group: { _id: "$eventId", gross: { $sum: "$total" } } },
  ]);

  let net = 0;
  for (const row of rows) {
    const fee = Math.round(row.gross * feeRate);
    net += row.gross - fee;
  }
  return net;
}

export function mapOrganizerPayoutListItem(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    status: doc.status,
    netAmount: doc.netAmount,
    grossAmount: doc.grossAmount,
    platformFee: doc.platformFee,
    requestedAt: doc.requestedAt,
    reviewedAt: doc.reviewedAt,
    paidAt: doc.paidAt,
    eventTitles: doc.eventTitles ?? [],
    rejectionReason: doc.status === PayoutStatus.Rejected ? doc.rejectionReason : undefined,
  };
}
