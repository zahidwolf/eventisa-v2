import { customAlphabet } from "nanoid";
import { paymentConfig } from "@/config/payment.config.js";
import { env } from "@/config/env.js";
import { BasePaymentProvider } from "@/modules/payments/providers/base-payment.provider.js";
import { MockPaymentOutcome, PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import type {
  CancelPaymentInput,
  CancelPaymentResult,
  InitializePaymentInput,
  InitializePaymentResult,
  QueryPaymentInput,
  QueryPaymentResult,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "@/modules/payments/types/payment.types.js";
import { MOCK_SIMULATION_DELAY_MS } from "@/modules/payments/constants/payment.constants.js";

const txnId = customAlphabet("0123456789", 12);

export class MockPaymentProvider extends BasePaymentProvider {
  readonly name = "mock";

  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const transactionId = `MOCK-${txnId()}`;
    const redirectUrl = `${env.CLIENT_URL}${paymentConfig.urls.mockSimulatePath}?paymentId=${input.paymentId}`;

    return {
      success: true,
      transactionId,
      redirectUrl,
      gatewayPayload: {
        mode: "mock",
        simulatedDelayMs: MOCK_SIMULATION_DELAY_MS,
        returnUrl: input.returnUrl,
      },
      message: "Mock payment initialized — simulate on frontend",
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const outcome = (input.gatewayPayload?.outcome as MockPaymentOutcome) ?? MockPaymentOutcome.Success;

    if (outcome === MockPaymentOutcome.Success) {
      return {
        success: true,
        status: PaymentRecordStatus.Paid,
        transactionId: input.transactionId,
        verificationPayload: { provider: "mock", outcome, verifiedAt: new Date().toISOString() },
      };
    }

    if (outcome === MockPaymentOutcome.Cancelled) {
      return {
        success: false,
        status: PaymentRecordStatus.Cancelled,
        failureReason: "Payment cancelled by user",
        verificationPayload: { provider: "mock", outcome },
      };
    }

    return {
      success: false,
      status: PaymentRecordStatus.Failed,
      failureReason: "Mock payment failed (simulated)",
      verificationPayload: { provider: "mock", outcome },
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return {
      success: true,
      status: PaymentRecordStatus.Refunded,
      message: `Mock refund processed for ${input.paymentId}`,
    };
  }

  async cancelPayment(_input: CancelPaymentInput): Promise<CancelPaymentResult> {
    return {
      success: true,
      status: PaymentRecordStatus.Cancelled,
      message: "Mock payment cancelled",
    };
  }

  async queryPayment(input: QueryPaymentInput): Promise<QueryPaymentResult> {
    return {
      success: true,
      status: PaymentRecordStatus.Pending,
      transactionId: input.transactionId,
      gatewayPayload: { provider: "mock", note: "Awaiting simulation" },
    };
  }
}
