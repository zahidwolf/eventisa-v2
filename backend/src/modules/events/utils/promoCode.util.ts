import { PromoCodeType, type PromoCodeDocument } from "@/modules/events/models/promoCode.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import type { OrderDocument } from "@/modules/orders/models/order.model.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function calculateDiscount(
  type: PromoCodeType,
  value: number,
  originalPrice: number,
  quantity: number
): number {
  const lineTotal = Math.max(0, originalPrice * quantity);
  if (lineTotal <= 0) return 0;

  let discount = 0;
  if (type === PromoCodeType.Percentage) {
    const pct = Math.min(100, Math.max(1, value));
    discount = Math.floor((lineTotal * pct) / 100);
  } else {
    discount = Math.min(lineTotal, Math.max(0, value) * quantity);
  }
  return Math.max(0, Math.min(discount, lineTotal));
}

export function promoStatusLabel(
  doc: Pick<PromoCodeDocument, "isActive" | "validUntil" | "maxUses" | "usedCount">
): "active" | "expired" | "exhausted" | "inactive" {
  if (!doc.isActive) return "inactive";
  if (doc.validUntil < new Date()) return "expired";
  if (doc.maxUses > 0 && doc.usedCount >= doc.maxUses) return "exhausted";
  return "active";
}

export function formatCodeStats(
  code: PromoCodeDocument,
  orders: Pick<OrderDocument, "discount" | "paymentStatus">[]
) {
  const paid = orders.filter((o) => o.paymentStatus === PaymentStatus.Paid);
  const totalUses = paid.length;
  const totalDiscountGiven = paid.reduce((s, o) => s + (o.discount ?? 0), 0);
  const conversionRate =
    code.usedCount > 0 && code.maxUses > 0
      ? Math.round((code.usedCount / code.maxUses) * 100)
      : totalUses > 0
        ? 100
        : 0;

  return { totalUses, totalDiscountGiven, conversionRate };
}
