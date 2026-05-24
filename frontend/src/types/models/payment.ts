export type PaymentMethodId =
  | "mock"
  | "bkash"
  | "nagad"
  | "card"
  | "sslcommerz"
  | "mobile_banking"
  | "internet_banking";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  provider: string;
  label: string;
  description: string;
  enabled: boolean;
  comingSoon: boolean;
}

export interface PaymentConfig {
  mode: "mock" | "live";
  methods: PaymentMethodOption[];
  mockDelayMs: number;
}

export interface InitializePaymentResponse {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  redirectUrl?: string;
  transactionId?: string;
}
