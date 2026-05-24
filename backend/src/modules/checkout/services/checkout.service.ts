import { cleanupExpiredReservations } from "@/modules/tickets/services/ticket-reservation.service.js";
import { completeOrderPayment } from "@/modules/orders/services/order.service.js";
import { generateTicketsForOrder } from "@/modules/tickets/services/ticket.service.js";
import {
  verifyPaymentAndFulfill,
} from "@/modules/payments/services/payment.service.js";
import { MockPaymentOutcome } from "@/modules/payments/types/payment.types.js";
import { onNewBooking, onTicketConfirmed } from "@/shared/email/emailTriggers.service.js";

/**
 * Fulfills order after confirmed payment (inventory + tickets).
 */
export async function fulfillPaidOrder(input: {
  orderRef: string;
  sessionId: string;
  paymentMethod: string;
  paymentId?: string;
}) {
  await cleanupExpiredReservations();

  const order = await completeOrderPayment(
    input.orderRef,
    input.sessionId,
    input.paymentMethod
  );
  const tickets = await generateTicketsForOrder(order._id.toString());

  const orderRef = order._id.toString();
  onTicketConfirmed(orderRef).catch((err) => console.error("Email trigger failed:", err));
  onNewBooking(orderRef).catch((err) => console.error("Email trigger failed:", err));

  return { order, tickets };
}

/**
 * Legacy checkout complete — supports paymentId (new) or direct demo (backward compatible).
 */
export async function completeCheckout(
  orderId: string,
  sessionId: string,
  paymentMethod?: string,
  paymentId?: string,
  mockOutcome?: MockPaymentOutcome
) {
  if (paymentId) {
    return verifyPaymentAndFulfill({
      paymentId,
      sessionId,
      outcome: mockOutcome,
    });
  }

  return fulfillPaidOrder({
    orderRef: orderId,
    sessionId,
    paymentMethod: paymentMethod ?? "legacy_demo",
  });
}
