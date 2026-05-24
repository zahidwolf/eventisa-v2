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

export interface IPaymentProvider {
  readonly name: string;

  initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult>;

  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;

  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;

  cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentResult>;

  queryPayment(input: QueryPaymentInput): Promise<QueryPaymentResult>;
}
