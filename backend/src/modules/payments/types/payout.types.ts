export enum PayoutStatus {
  Pending = "pending",
  Approved = "approved",
  Paid = "paid",
  Rejected = "rejected",
}

export const ACTIVE_PAYOUT_STATUSES = [
  PayoutStatus.Pending,
  PayoutStatus.Approved,
  PayoutStatus.Paid,
] as const;

export interface BankingSnapshot {
  preferredMethod?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  branchName?: string;
  routingNumber?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
}
