import { paymentConfig } from "@/config/payment.config.js";
import { BasePaymentProvider } from "@/modules/payments/providers/base-payment.provider.js";
import type { BkashCredentials } from "@/modules/payments/types/gateway.types.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import type {
  InitializePaymentInput,
  InitializePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "@/modules/payments/types/payment.types.js";

export class BkashPaymentProvider extends BasePaymentProvider {
  readonly name = "bkash";

  constructor(private readonly gatewayCredentials?: Record<string, unknown>) {
    super();
  }

  private creds(): BkashCredentials {
    const c = this.gatewayCredentials as Partial<BkashCredentials> | undefined;
    if (c?.appKey && c?.appSecret && c?.username && c?.password) {
      return {
        appKey: c.appKey,
        appSecret: c.appSecret,
        username: c.username,
        password: c.password,
        sandbox: !!c.sandbox,
      };
    }
    return {
      appKey: paymentConfig.providers.bkash.appKey,
      appSecret: paymentConfig.providers.bkash.secret,
      username: process.env.BKASH_USERNAME ?? "",
      password: process.env.BKASH_PASSWORD ?? "",
      sandbox: paymentConfig.mode !== "live",
    };
  }

  private baseUrl(c: BkashCredentials) {
    return c.sandbox
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout";
  }

  private async grantToken(c: BkashCredentials): Promise<string> {
    const res = await fetch(`${this.baseUrl(c)}/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        username: c.username,
        password: c.password,
      },
      body: JSON.stringify({ app_key: c.appKey, app_secret: c.appSecret }),
    });
    const data = (await res.json()) as { id_token?: string; statusMessage?: string };
    if (!data.id_token) {
      throw new Error(data.statusMessage ?? "bKash token grant failed");
    }
    return data.id_token;
  }

  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const c = this.creds();
    if (!c.appKey || !c.appSecret || !c.username || !c.password) {
      return this.pendingResult("bKash credentials incomplete");
    }

    const token = await this.grantToken(c);
    const res = await fetch(`${this.baseUrl(c)}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
        "x-app-key": c.appKey,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: input.customerPhone,
        callbackURL: (input.metadata?.callbackUrl as string) ?? input.returnUrl,
        amount: String(input.amount),
        currency: input.currency || "BDT",
        intent: "sale",
        merchantInvoiceNumber: input.paymentId,
      }),
    });

    const data = (await res.json()) as {
      paymentID?: string;
      bkashURL?: string;
      statusMessage?: string;
    };

    if (data.bkashURL && data.paymentID) {
      return {
        success: true,
        transactionId: data.paymentID,
        redirectUrl: data.bkashURL,
        gatewayPayload: data as Record<string, unknown>,
      };
    }

    return {
      success: false,
      message: data.statusMessage ?? "bKash create payment failed",
      gatewayPayload: data as Record<string, unknown>,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const c = this.creds();
    const paymentId = (input.gatewayPayload?.paymentID as string) ?? input.transactionId;
    if (!paymentId) {
      return {
        success: false,
        status: PaymentRecordStatus.Failed,
        failureReason: "Missing bKash payment ID",
      };
    }

    try {
      const token = await this.grantToken(c);
      const res = await fetch(`${this.baseUrl(c)}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
          "x-app-key": c.appKey,
        },
        body: JSON.stringify({ paymentID: paymentId }),
      });
      const data = (await res.json()) as { transactionStatus?: string; trxID?: string };
      if (data.transactionStatus === "Completed") {
        return {
          success: true,
          status: PaymentRecordStatus.Paid,
          transactionId: data.trxID ?? paymentId,
          verificationPayload: data as Record<string, unknown>,
        };
      }
      return {
        success: false,
        status: PaymentRecordStatus.Failed,
        failureReason: data.transactionStatus ?? "bKash payment not completed",
        verificationPayload: data as Record<string, unknown>,
      };
    } catch (err) {
      return {
        success: false,
        status: PaymentRecordStatus.Failed,
        failureReason: err instanceof Error ? err.message : "bKash verify failed",
      };
    }
  }
}
