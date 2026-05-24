import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { User } from "@/modules/users/models/user.model.js";
import { Payout } from "@/modules/payments/models/payout.model.js";
import {
  ACTIVE_PAYOUT_STATUSES,
  type BankingSnapshot,
} from "@/modules/payments/types/payout.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { PayoutMethod } from "@/modules/organizers/types/organizer-settings.types.js";
import { Role } from "@/shared/enums/role.enum.js";
import { UserStatus } from "@/modules/users/types/user.types.js";
import { getServiceFeeRate, getPlatformSettings } from "@/modules/admin/services/platformSettings.service.js";

export async function resolveOrganizerByUserId(userId: string) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) {
    throw new AppError("Organizer profile not found", 404, ErrorCodes.NOT_FOUND);
  }
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  return { organizer, user };
}

export function buildBankingSnapshot(paymentInfo: Record<string, unknown>): BankingSnapshot {
  return {
    preferredMethod: paymentInfo.preferredPayoutMethod as string | undefined,
    bankName: paymentInfo.bankName as string | undefined,
    accountNumber: paymentInfo.accountNumber as string | undefined,
    accountName: paymentInfo.accountHolderName as string | undefined,
    branchName: paymentInfo.branchName as string | undefined,
    routingNumber: paymentInfo.routingNumber as string | undefined,
    bkashNumber: paymentInfo.bkashNumber as string | undefined,
    nagadNumber: paymentInfo.nagadNumber as string | undefined,
    rocketNumber: paymentInfo.rocketNumber as string | undefined,
  };
}

export function isBankingConfigured(paymentInfo: Record<string, unknown>): boolean {
  const method = paymentInfo.preferredPayoutMethod as PayoutMethod | undefined;
  if (!method) return false;
  if (method === PayoutMethod.BankTransfer) {
    return !!(paymentInfo.bankName && paymentInfo.accountNumber && paymentInfo.accountHolderName);
  }
  if (method === PayoutMethod.Bkash) return !!paymentInfo.bkashNumber;
  if (method === PayoutMethod.Nagad) return !!paymentInfo.nagadNumber;
  if (method === PayoutMethod.Rocket) return !!paymentInfo.rocketNumber;
  return false;
}

export async function getLockedEventIds(organizerId: mongoose.Types.ObjectId) {
  const payouts = await Payout.find({
    organizerId,
    status: { $in: ACTIVE_PAYOUT_STATUSES },
  })
    .select("eventIds")
    .lean();
  const ids = new Set<string>();
  for (const p of payouts) {
    for (const id of p.eventIds ?? []) {
      ids.add(id.toString());
    }
  }
  return ids;
}

export async function eventRevenueMap(organizerId: mongoose.Types.ObjectId) {
  const rows = await Order.aggregate([
    { $match: { paymentStatus: PaymentStatus.Paid, organizerId } },
    {
      $group: {
        _id: "$eventId",
        grossRevenue: { $sum: "$total" },
        ticketsSold: { $sum: { $sum: "$ticketItems.quantity" } },
        orderCount: { $sum: 1 },
      },
    },
  ]);
  const feeRate = await getServiceFeeRate();
  const map = new Map<
    string,
    { grossRevenue: number; platformFee: number; netRevenue: number; ticketsSold: number; orderCount: number }
  >();
  for (const row of rows) {
    const gross = row.grossRevenue ?? 0;
    const platformFee = Math.round(gross * feeRate);
    map.set(row._id.toString(), {
      grossRevenue: gross,
      platformFee,
      netRevenue: gross - platformFee,
      ticketsSold: row.ticketsSold ?? 0,
      orderCount: row.orderCount ?? 0,
    });
  }
  return map;
}

export async function getMinimumPayoutAmount() {
  const settings = await getPlatformSettings();
  return settings.fees.minimumPayoutAmount ?? 500;
}

export async function getAdminNotificationEmails() {
  const users = await User.find({
    role: { $in: [Role.Admin, Role.SuperAdmin] },
    status: UserStatus.Active,
  })
    .select("email")
    .lean();
  return users.map((u) => u.email).filter(Boolean) as string[];
}

export async function loadPayoutForOrganizer(payoutId: string, organizerId: mongoose.Types.ObjectId) {
  if (!mongoose.isValidObjectId(payoutId)) {
    throw new AppError("Invalid payout id", 400, ErrorCodes.VALIDATION_ERROR);
  }
  const payout = await Payout.findOne({ _id: payoutId, organizerId });
  if (!payout) throw new AppError("Payout not found", 404, ErrorCodes.NOT_FOUND);
  return payout;
}

export async function loadPayoutById(payoutId: string) {
  if (!mongoose.isValidObjectId(payoutId)) {
    throw new AppError("Invalid payout id", 400, ErrorCodes.VALIDATION_ERROR);
  }
  const payout = await Payout.findById(payoutId);
  if (!payout) throw new AppError("Payout not found", 404, ErrorCodes.NOT_FOUND);
  return payout;
}

export function payoutableEventFilter(organizerId: mongoose.Types.ObjectId) {
  const now = new Date();
  return {
    organizer: organizerId,
    startDate: { $lte: now },
    status: { $in: [EventStatus.Live, EventStatus.Ended, EventStatus.Approved] },
  };
}
