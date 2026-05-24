import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Payment } from "@/modules/payments/models/payment.model.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import { verifyPaymentAndFulfill } from "@/modules/payments/services/payment.service.js";

export async function handleProviderCallback(
  provider: string,
  payload: Record<string, unknown>
) {
  const paymentId =
    (payload.paymentId as string) ??
    (payload.merchantInvoiceNumber as string) ??
    (payload.tran_id as string);

  const payment = paymentId
    ? await Payment.findOne({ paymentId })
    : await Payment.findOne({
        transactionId: (payload.paymentID as string) ?? (payload.tran_id as string),
        status: PaymentRecordStatus.Pending,
      });

  if (!payment) {
    throw new AppError("Payment not found for callback", 404, ErrorCodes.NOT_FOUND);
  }

  return verifyPaymentAndFulfill({
    paymentId: payment.paymentId,
    sessionId: payment.sessionId,
    gatewayPayload: { ...payment.gatewayPayload, ...payload, provider },
  });
}
