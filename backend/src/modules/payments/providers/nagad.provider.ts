import { paymentConfig } from "@/config/payment.config.js";
import { BasePaymentProvider } from "@/modules/payments/providers/base-payment.provider.js";
import type { NagadCredentials } from "@/modules/payments/types/gateway.types.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import type {
  InitializePaymentInput,
  InitializePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "@/modules/payments/types/payment.types.js";

export class NagadPaymentProvider extends BasePaymentProvider {
  readonly name = "nagad";

  constructor(private readonly gatewayCredentials?: Record<string, unknown>) {
    super();
  }

  private creds(): NagadCredentials {
    const c = this.gatewayCredentials as Partial<NagadCredentials> | undefined;
    if (c?.merchantId && c?.merchantNumber && c?.privKey) {
      return {
        merchantId: c.merchantId,
        merchantNumber: c.merchantNumber,
        pubKey: c.pubKey ?? "",
        privKey: c.privKey,
        sandbox: !!c.sandbox,
      };
    }
    return {
      merchantId: paymentConfig.providers.nagad.merchantId,
      merchantNumber: process.env.NAGAD_MERCHANT_NUMBER ?? "",
      pubKey: process.env.NAGAD_PUBLIC_KEY ?? "",
      privKey: process.env.NAGAD_PRIVATE_KEY ?? "",
      sandbox: paymentConfig.mode !== "live",
    };
  }

  private baseUrl(c: NagadCredentials) {
    return c.sandbox
      ? "https://api.mynagad.com:10060/remote-payment-gateway-1.0"
      : "https://api.mynagad.com/remote-payment-gateway-1.0";
  }

  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const c = this.creds();
    if (!c.merchantId || !c.merchantNumber || !c.privKey) {
      return this.pendingResult("Nagad credentials incomplete");
    }

    const orderId = input.paymentId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
    const initUrl = `${this.baseUrl(c)}/api/dfs/check-out/initialize/${c.merchantId}/${orderId}`;

    const sensitive = {
      merchantId: c.merchantId,
      datetime: new Date().toISOString(),
      orderId,
      challenge: orderId,
    };

    const payload = {
      accountNumber: c.merchantNumber,
      dateTime: sensitive.datetime,
      sensitiveData: Buffer.from(JSON.stringify(sensitive)).toString("base64"),
      signature: Buffer.from(c.privKey.slice(0, 64)).toString("base64"),
    };

    try {
      const res = await fetch(initUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-KM-IP-V4": "127.0.0.1" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        sensitiveData?: string;
        message?: string;
        reason?: string;
      };

      if (data.sensitiveData) {
        const decoded = JSON.parse(
          Buffer.from(data.sensitiveData, "base64").toString("utf8")
        ) as { paymentReferenceId?: string; redirectUrl?: string };
        if (decoded.redirectUrl) {
          return {
            success: true,
            transactionId: decoded.paymentReferenceId ?? orderId,
            redirectUrl: decoded.redirectUrl,
            gatewayPayload: { ...data, decoded },
          };
        }
      }

      return {
        success: false,
        message: data.message ?? data.reason ?? "Nagad initialize failed",
        gatewayPayload: data as Record<string, unknown>,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Nagad request failed",
      };
    }
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const status = input.gatewayPayload?.status as string | undefined;
    if (status === "Success" || status === "success") {
      return {
        success: true,
        status: PaymentRecordStatus.Paid,
        transactionId: input.transactionId,
        verificationPayload: input.gatewayPayload,
      };
    }
    return {
      success: false,
      status: PaymentRecordStatus.Failed,
      failureReason: "Nagad payment not verified",
      verificationPayload: input.gatewayPayload,
    };
  }
}
