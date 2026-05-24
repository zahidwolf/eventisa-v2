import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

export function generatePaymentId(): string {
  return `PAY-${nanoid()}`;
}
