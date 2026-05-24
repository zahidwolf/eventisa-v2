import { customAlphabet } from "nanoid";
import { ORDER_ID_PREFIX } from "@/shared/constants/booking.constants.js";

const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export function generateOrderId(): string {
  return `${ORDER_ID_PREFIX}-${nanoid()}`;
}

export function generateTicketNumber(): string {
  return `TKT-${customAlphabet("0123456789", 10)()}`;
}
