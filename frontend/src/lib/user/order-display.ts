import { formatEventDate } from "@/lib/events/event-utils";

export function orderStatusLabel(paymentStatus: string, orderStatus: string) {
  if (paymentStatus === "refunded") return { label: "Refunded", className: "bg-zinc-500/20 text-zinc-400" };
  if (orderStatus === "cancelled" || paymentStatus === "failed") {
    return { label: "Cancelled", className: "bg-red-500/20 text-red-300" };
  }
  if (paymentStatus === "paid") return { label: "Confirmed", className: "bg-emerald-500/20 text-emerald-300" };
  return { label: paymentStatus, className: "bg-amber-500/20 text-amber-300" };
}

export function shortOrderId(orderId: string) {
  return orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId.toUpperCase();
}

export function formatOrderDate(iso: string) {
  return formatEventDate(iso, "long");
}

export function isCancelledTicket(paymentStatus: string, orderStatus: string) {
  return paymentStatus === "refunded" || orderStatus === "cancelled" || paymentStatus === "failed";
}

export function venueLabel(name?: string) {
  if (!name) return "Online";
  if (/online|zoom|virtual|meet/i.test(name)) return "Online";
  return name;
}

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}
