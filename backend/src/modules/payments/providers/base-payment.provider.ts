import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import type { IPaymentProvider } from "@/modules/payments/interfaces/payment-provider.interface.js";
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

export abstract class BasePaymentProvider implements IPaymentProvider {
  abstract readonly name: string;

  abstract initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult>;

  abstract verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;

  async refundPayment(_input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return this.notIntegrated("refundPayment");
  }

  async cancelPayment(_input: CancelPaymentInput): Promise<CancelPaymentResult> {
    return this.notIntegrated("cancelPayment");
  }

  async queryPayment(_input: QueryPaymentInput): Promise<QueryPaymentResult> {
    return this.notIntegrated("queryPayment");
  }

  protected notIntegrated(operation = "operation"): never {
    throw new AppError(
      `${this.name} ${operation} is not configured. Add API credentials to .env and set PAYMENT_MODE=live.`,
      501,
      ErrorCodes.NOT_FOUND
    );
  }

  protected pendingResult(message: string): InitializePaymentResult {
    return { success: false, message };
  }
}
