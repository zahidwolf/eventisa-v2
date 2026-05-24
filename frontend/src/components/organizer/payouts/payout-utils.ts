import type { BankingSnapshot, PayoutStatus } from "@/types/payout.types";

export function maskLast4(value?: string): string {
  if (!value) return "—";
  const t = value.replace(/\s/g, "");
  if (t.length <= 4) return t;
  return `•••• ${t.slice(-4)}`;
}

export function formatBankingLabel(snapshot: BankingSnapshot): string {
  const method = snapshot.preferredMethod ?? "Bank";
  if (method.toLowerCase().includes("bkash") && snapshot.bkashNumber) {
    return `bKash ${maskLast4(snapshot.bkashNumber)}`;
  }
  if (method.toLowerCase().includes("nagad") && snapshot.nagadNumber) {
    return `Nagad ${maskLast4(snapshot.nagadNumber)}`;
  }
  if (method.toLowerCase().includes("rocket") && snapshot.rocketNumber) {
    return `Rocket ${maskLast4(snapshot.rocketNumber)}`;
  }
  if (snapshot.accountNumber) {
    return `${snapshot.bankName ?? "Bank"} ${maskLast4(snapshot.accountNumber)}`;
  }
  return method;
}

export function payoutStatusLabel(status: PayoutStatus): string {
  switch (status) {
    case "pending":
      return "Under Review";
    case "approved":
      return "Approved";
    case "paid":
      return "Paid";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export function payoutStatusClass(status: PayoutStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "approved":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "paid":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "rejected":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-500/15 text-zinc-400";
  }
}
