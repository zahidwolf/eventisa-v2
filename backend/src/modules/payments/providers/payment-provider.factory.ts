import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { paymentConfig } from "@/config/payment.config.js";
import type { IPaymentProvider } from "@/modules/payments/interfaces/payment-provider.interface.js";
import { PaymentProviderName } from "@/modules/payments/types/payment.types.js";
import { MockPaymentProvider } from "@/modules/payments/providers/mock.provider.js";
import { SslcommerzPaymentProvider } from "@/modules/payments/providers/sslcommerz.provider.js";
import { BkashPaymentProvider } from "@/modules/payments/providers/bkash.provider.js";
import { NagadPaymentProvider } from "@/modules/payments/providers/nagad.provider.js";

const mockSingleton = new MockPaymentProvider();

export function paymentProviderFactory(
  provider: PaymentProviderName,
  credentials?: Record<string, unknown>
): IPaymentProvider {
  switch (provider) {
    case PaymentProviderName.Mock:
      return mockSingleton;
    case PaymentProviderName.Sslcommerz:
      return new SslcommerzPaymentProvider(credentials);
    case PaymentProviderName.Bkash:
      return new BkashPaymentProvider(credentials);
    case PaymentProviderName.Nagad:
      return new NagadPaymentProvider(credentials);
    default:
      throw new AppError(`Unknown payment provider: ${provider}`, 400, ErrorCodes.VALIDATION_ERROR);
  }
}

export function resolveActiveProvider(requested: PaymentProviderName): PaymentProviderName {
  if (paymentConfig.mode === "mock") {
    return PaymentProviderName.Mock;
  }
  return requested;
}
