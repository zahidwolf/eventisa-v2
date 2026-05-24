import { PaymentMethod, PaymentProviderName } from "@/modules/payments/types/payment.types.js";

export const PROVIDER_METHOD_MAP: Record<PaymentProviderName, PaymentMethod[]> = {
  [PaymentProviderName.Mock]: [PaymentMethod.Mock],
  [PaymentProviderName.Bkash]: [PaymentMethod.Bkash],
  [PaymentProviderName.Nagad]: [PaymentMethod.Nagad],
  [PaymentProviderName.Sslcommerz]: [
    PaymentMethod.Card,
    PaymentMethod.Sslcommerz,
    PaymentMethod.MobileBanking,
    PaymentMethod.InternetBanking,
  ],
};

export const MOCK_SIMULATION_DELAY_MS = 2000;
