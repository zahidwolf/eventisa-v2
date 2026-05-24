import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { env } from "@/config/env.js";
import {
  getAvailablePaymentMethods,
  paymentConfig,
  resolveProviderForMethod,
} from "@/config/payment.config.js";
import { generatePaymentId } from "@/shared/utils/payment-id.util.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus as OrderPaymentStatus } from "@/modules/orders/types/order.types.js";
import { Payment } from "@/modules/payments/models/payment.model.js";
import {
  paymentProviderFactory,
  resolveActiveProvider,
} from "@/modules/payments/providers/payment-provider.factory.js";
import {
  MockPaymentOutcome,
  PaymentMethod,
  PaymentProviderName,
  PaymentRecordStatus,
} from "@/modules/payments/types/payment.types.js";
import { fulfillPaidOrder } from "@/modules/checkout/services/checkout.service.js";
import {
  getEventGateway,
  getEventGatewayPublicInfo,
  paymentMethodFromGateway,
  providerNameFromGateway,
} from "@/modules/payments/services/gatewayManager.service.js";
import {
  processPayment,
  shouldUseEventGateway,
} from "@/modules/payments/services/gatewayRouter.service.js";
export function getPaymentConfigForClient() {
  return {
    mode: paymentConfig.mode,
    methods: getAvailablePaymentMethods(),
    mockDelayMs: 2000,
  };
}

export async function getPaymentConfigForEvent(eventId: string) {
  const gateway = await getEventGateway(eventId);
  const publicInfo = await getEventGatewayPublicInfo(eventId);
  const method = paymentMethodFromGateway(gateway.provider);
  const provider = providerNameFromGateway(gateway.provider);
  const mockOnly = paymentConfig.mode === "mock";

  return {
    mode: paymentConfig.mode,
    gateway: publicInfo,
    methods: [
      {
        id: method,
        provider,
        label: gateway.displayName,
        description: `Pay via ${gateway.displayName}`,
        enabled: !mockOnly && gateway.isActive,
        comingSoon: mockOnly,
      },
      ...(mockOnly
        ? getAvailablePaymentMethods().filter((m) => m.id === PaymentMethod.Mock)
        : []),
    ],
    mockDelayMs: 2000,
  };
}

export async function initializePaymentForOrder(input: {
  orderId: string;
  sessionId: string;
  method: PaymentMethod;
}) {
  const order = await Order.findOne(
    orderIdQuery(input.orderId)
  );

  if (!order) {
    throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  }

  const reservation = await validateOrderSession(order, input.sessionId);

  if (order.paymentStatus === OrderPaymentStatus.Paid) {
    throw new AppError("Order already paid", 400, ErrorCodes.CONFLICT);
  }

  const paymentId = generatePaymentId();
  const returnUrl = `${env.CLIENT_URL}${paymentConfig.urls.successPath}?orderId=${order.orderId}`;
  const cancelUrl = `${env.CLIENT_URL}${paymentConfig.urls.cancelledPath}`;

  const initPayload = {
    paymentId,
    orderId: order.orderId,
    amount: order.total,
    currency: order.currency,
    customerEmail: order.guestEmail,
    customerPhone: order.guestPhone,
    customerName: order.guestName,
    returnUrl,
    cancelUrl,
    metadata: { sessionId: input.sessionId, method: input.method },
  };

  let initResult;
  let providerName: PaymentProviderName;

  if (shouldUseEventGateway()) {
    const routed = await processPayment(order.eventId.toString(), {
      ...initPayload,
      eventId: order.eventId.toString(),
    });
    initResult = routed;
    providerName = routed.provider;
  } else {
    const requestedProvider = resolveProviderForMethod(input.method);
    providerName = resolveActiveProvider(requestedProvider);
    const provider = paymentProviderFactory(providerName);
    initResult = await provider.initializePayment(initPayload);
  }

  if (!initResult.success) {
    throw new AppError(initResult.message ?? "Payment initialization failed", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const payment = await Payment.create({
    paymentId,
    orderId: order._id,
    orderRef: order.orderId,
    sessionId: input.sessionId,
    provider: providerName,
    method: input.method,
    transactionId: initResult.transactionId,
    amount: order.total,
    currency: order.currency,
    status: PaymentRecordStatus.Pending,
    gatewayPayload: initResult.gatewayPayload ?? {},
  });

  void reservation;

  return {
    payment,
    redirectUrl: initResult.redirectUrl,
    transactionId: initResult.transactionId,
    eventId: order.eventId,
  };
}

export async function verifyPaymentAndFulfill(input: {
  paymentId: string;
  sessionId: string;
  outcome?: MockPaymentOutcome;
  gatewayPayload?: Record<string, unknown>;
}) {
  const payment = await Payment.findOne({ paymentId: input.paymentId, sessionId: input.sessionId });

  if (!payment) {
    throw new AppError("Payment not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (payment.status === PaymentRecordStatus.Paid) {
    const order = await Order.findById(payment.orderId);
    const { Ticket } = await import("@/modules/tickets/models/ticket.model.js");
    const tickets = await Ticket.find({ orderId: payment.orderId });
    return { payment, alreadyPaid: true, order, tickets };
  }

  let gatewayCredentials: Record<string, unknown> | undefined;
  if (shouldUseEventGateway()) {
    const order = await Order.findById(payment.orderId);
    if (order) {
      const gw = await getEventGateway(order.eventId.toString());
      gatewayCredentials = gw.credentials as Record<string, unknown>;
    }
  }

  const provider = paymentProviderFactory(
    payment.provider as PaymentProviderName,
    gatewayCredentials
  );

  const verifyResult = await provider.verifyPayment({
    paymentId: payment.paymentId,
    transactionId: payment.transactionId,
    gatewayPayload:
      input.gatewayPayload ??
      (input.outcome ? { outcome: input.outcome, ...payment.gatewayPayload } : payment.gatewayPayload),
  });

  payment.verificationPayload = verifyResult.verificationPayload ?? {};
  payment.transactionId = verifyResult.transactionId ?? payment.transactionId;

  if (!verifyResult.success) {
    payment.status = verifyResult.status;
    payment.failureReason = verifyResult.failureReason;
    await payment.save();
    throw new AppError(verifyResult.failureReason ?? "Payment failed", 402, ErrorCodes.VALIDATION_ERROR);
  }

  payment.status = PaymentRecordStatus.Paid;
  payment.paidAt = new Date();
  await payment.save();

  const fulfillment = await fulfillPaidOrder({
    orderRef: payment.orderRef,
    sessionId: input.sessionId,
    paymentMethod: `${payment.provider}:${payment.method}`,
    paymentId: payment.paymentId,
  });

  return { payment, ...fulfillment, alreadyPaid: false };
}

export async function getPaymentStatus(paymentId: string, sessionId?: string) {
  const query: Record<string, string> = { paymentId };
  if (sessionId) query.sessionId = sessionId;

  const payment = await Payment.findOne(query);
  if (!payment) {
    throw new AppError("Payment not found", 404, ErrorCodes.NOT_FOUND);
  }
  return payment;
}

function orderIdQuery(orderId: string) {
  return mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderId };
}

async function validateOrderSession(order: { reservationId: unknown }, sessionId: string) {
  const { TicketReservation } = await import("@/modules/tickets/models/ticket-reservation.model.js");
  const reservation = await TicketReservation.findById(order.reservationId);
  if (!reservation || reservation.sessionId !== sessionId) {
    throw new AppError("Invalid session", 403, ErrorCodes.FORBIDDEN);
  }
  return reservation;
}
