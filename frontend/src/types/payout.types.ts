export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";

export interface BankingSnapshot {
  preferredMethod?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  branchName?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
}

/** GET /organizer/payouts/summary — six aggregate numbers only */
export interface PayoutSummary {
  totalGrossEarned: number;
  totalPlatformFees: number;
  totalNetEarned: number;
  totalPaidOut: number;
  pendingPayout: number;
  availableForPayout: number;
}

export interface PayoutableEvent {
  eventId: string;
  title: string;
  startDate: string;
  endDate?: string;
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
  ticketsSold: number;
  alreadyPaidOut: boolean;
}

/** GET /organizer/payouts list item */
export interface PayoutListItem {
  _id: string;
  status: PayoutStatus;
  netAmount: number;
  grossAmount: number;
  platformFee: number;
  requestedAt: string;
  reviewedAt?: string;
  paidAt?: string;
  eventTitles: string[];
  rejectionReason?: string;
}

export interface PayoutRecord extends PayoutListItem {
  organizerId?: string;
  organizerName?: string;
  organizationName?: string;
  eventIds?: string[];
  currency?: string;
  requestNote?: string;
  bankingSnapshot?: BankingSnapshot;
  reviewedByName?: string;
  txRef?: string;
  paymentMethod?: string;
  paymentNote?: string;
}

export interface AdminPayoutStats {
  totalPendingCount: number;
  totalPendingAmount: number;
  totalApprovedCount: number;
  totalApprovedAmount: number;
  totalPaidThisMonth: number;
  totalPaidAllTime: number;
  totalPlatformFeesCollected: number;
}

export interface PayoutEventBreakdown {
  eventId: string;
  title: string;
  startDate: string;
  gross: number;
  fee: number;
  net: number;
  ticketsSold: number;
}

export interface AdminPayoutDetail {
  payout: PayoutRecord;
  eventBreakdown: PayoutEventBreakdown[];
  organizerEmail?: string;
}
