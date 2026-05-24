import {
  PaymentMethod,
  PaymentProviderName,
} from "@/modules/payments/types/payment.types.js";

export type PaymentMode = "mock" | "live";

function envFlag(key: string, defaultValue = false): boolean {
  const val = process.env[key];
  if (val === undefined) return defaultValue;
  return val === "true" || val === "1";
}

export const paymentConfig = {
  mode: (process.env.PAYMENT_MODE ?? "mock") as PaymentMode,

  features: {
    mock: true,
    sslcommerz: envFlag("ENABLE_SSL", false),
    bkash: envFlag("ENABLE_BKASH", false),
    nagad: envFlag("ENABLE_NAGAD", false),
  },

  providers: {
    sslcommerz: {
      storeId: process.env.SSLCOMMERZ_STORE_ID ?? "",
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD ?? "",
      // TODO: SSLCOMMERZ_IS_LIVE=true for production
    },
    bkash: {
      appKey: process.env.BKASH_APP_KEY ?? "",
      secret: process.env.BKASH_SECRET ?? "",
      // TODO: BKASH_USERNAME, BKASH_PASSWORD when integrating
    },
    nagad: {
      merchantId: process.env.NAGAD_MERCHANT_ID ?? "",
      // TODO: NAGAD_PRIVATE_KEY, NAGAD_PUBLIC_KEY when integrating
    },
  },

  urls: {
    successPath: "/checkout/payment/success",
    failedPath: "/checkout/payment/failed",
    cancelledPath: "/checkout/payment/cancelled",
    mockSimulatePath: "/checkout/payment/mock",
  },
} as const;

export interface PaymentMethodOption {
  id: PaymentMethod;
  provider: PaymentProviderName;
  label: string;
  description: string;
  enabled: boolean;
  comingSoon: boolean;
}

export function getAvailablePaymentMethods(): PaymentMethodOption[] {
  const { mode, features } = paymentConfig;
  const mockOnly = mode === "mock";

  return [
    {
      id: PaymentMethod.Bkash,
      provider: PaymentProviderName.Bkash,
      label: "bKash",
      description: "Pay with bKash wallet",
      enabled: !mockOnly && features.bkash,
      comingSoon: mockOnly || !features.bkash,
    },
    {
      id: PaymentMethod.Nagad,
      provider: PaymentProviderName.Nagad,
      label: "Nagad",
      description: "Pay with Nagad",
      enabled: !mockOnly && features.nagad,
      comingSoon: mockOnly || !features.nagad,
    },
    {
      id: PaymentMethod.Card,
      provider: PaymentProviderName.Sslcommerz,
      label: "Card / SSLCommerz",
      description: "Visa, Mastercard, AMEX",
      enabled: !mockOnly && features.sslcommerz,
      comingSoon: mockOnly || !features.sslcommerz,
    },
    {
      id: PaymentMethod.MobileBanking,
      provider: PaymentProviderName.Sslcommerz,
      label: "Mobile Banking",
      description: "Bank apps via SSLCommerz",
      enabled: !mockOnly && features.sslcommerz,
      comingSoon: mockOnly || !features.sslcommerz,
    },
    {
      id: PaymentMethod.InternetBanking,
      provider: PaymentProviderName.Sslcommerz,
      label: "Internet Banking",
      description: "Online banking via SSLCommerz",
      enabled: !mockOnly && features.sslcommerz,
      comingSoon: mockOnly || !features.sslcommerz,
    },
    {
      id: PaymentMethod.Mock,
      provider: PaymentProviderName.Mock,
      label: "Demo Payment",
      description: "Simulate payment (development only)",
      enabled: mockOnly || features.mock,
      comingSoon: false,
    },
  ];
}

export function resolveProviderForMethod(method: PaymentMethod): PaymentProviderName {
  const option = getAvailablePaymentMethods().find((m) => m.id === method);
  return option?.provider ?? PaymentProviderName.Mock;
}
