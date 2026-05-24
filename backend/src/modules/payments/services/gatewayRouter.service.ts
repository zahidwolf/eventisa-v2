import { paymentConfig } from "@/config/payment.config.js";
import { env } from "@/config/env.js";
import { paymentProviderFactory } from "@/modules/payments/providers/payment-provider.factory.js";
import {
  getEventGateway,
  paymentMethodFromGateway,
  providerNameFromGateway,
} from "@/modules/payments/services/gatewayManager.service.js";
import type { InitializePaymentInput, InitializePaymentResult } from "@/modules/payments/types/payment.types.js";
import { PaymentProviderName } from "@/modules/payments/types/payment.types.js";

export interface ProcessPaymentOrderData extends InitializePaymentInput {
  eventId: string;
}

export async function processPayment(
  eventId: string,
  orderData: ProcessPaymentOrderData
): Promise<InitializePaymentResult & { provider: PaymentProviderName; method: string }> {
  const gateway = await getEventGateway(eventId);
  const providerName = providerNameFromGateway(gateway.provider);
  const provider = paymentProviderFactory(providerName, gateway.credentials);

  const apiOrigin =
    process.env.API_PUBLIC_URL ??
    `http://localhost:${process.env.PORT ?? "5000"}${env.API_PREFIX}`;
  const callbackBase = `${apiOrigin}/payments/callback`;

  const result = await provider.initializePayment({
    ...orderData,
    metadata: {
      ...orderData.metadata,
      gatewayId: gateway._id.toString(),
      provider: gateway.provider,
      callbackUrl: `${callbackBase}/${gateway.provider}`,
    },
  });

  return {
    ...result,
    provider: providerName,
    method: paymentMethodFromGateway(gateway.provider),
  };
}

export function shouldUseEventGateway(): boolean {
  return paymentConfig.mode === "live";
}
