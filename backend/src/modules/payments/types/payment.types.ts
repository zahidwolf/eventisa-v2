export enum PaymentProviderName {
  Mock = "mock",
  Sslcommerz = "sslcommerz",
  Bkash = "bkash",
  Nagad = "nagad",
}

export enum PaymentMethod {
  Mock = "mock",
  Bkash = "bkash",
  Nagad = "nagad",
  Card = "card",
  Sslcommerz = "sslcommerz",
  MobileBanking = "mobile_banking",
  InternetBanking = "internet_banking",
}

export enum PaymentRecordStatus {
  Initiated = "initiated",
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Cancelled = "cancelled",
  Refunded = "refunded",
}

export enum MockPaymentOutcome {
  Success = "success",
  Failed = "failed",
  Cancelled = "cancelled",
}

export interface InitializePaymentInput {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializePaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  gatewayPayload?: Record<string, unknown>;
  message?: string;
}

export interface VerifyPaymentInput {
  paymentId: string;
  transactionId?: string;
  gatewayPayload?: Record<string, unknown>;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: PaymentRecordStatus;
  transactionId?: string;
  verificationPayload?: Record<string, unknown>;
  failureReason?: string;
}

export interface RefundPaymentInput {
  paymentId: string;
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface RefundPaymentResult {
  success: boolean;
  status: PaymentRecordStatus;
  message?: string;
}

export interface CancelPaymentInput {
  paymentId: string;
  transactionId?: string;
  reason?: string;
}

export interface CancelPaymentResult {
  success: boolean;
  status: PaymentRecordStatus;
  message?: string;
}

export interface QueryPaymentInput {
  paymentId: string;
  transactionId?: string;
}

export interface QueryPaymentResult {
  success: boolean;
  status: PaymentRecordStatus;
  transactionId?: string;
  gatewayPayload?: Record<string, unknown>;
}
