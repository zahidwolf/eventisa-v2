import { paymentConfig } from "@/config/payment.config.js";
import { BasePaymentProvider } from "@/modules/payments/providers/base-payment.provider.js";
import type { SslcommerzCredentials } from "@/modules/payments/types/gateway.types.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import type {
  InitializePaymentInput,
  InitializePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "@/modules/payments/types/payment.types.js";

export class SslcommerzPaymentProvider extends BasePaymentProvider {
  readonly name = "sslcommerz";

  constructor(private readonly gatewayCredentials?: Record<string, unknown>) {
    super();
  }

  private creds(): SslcommerzCredentials {
    const c = this.gatewayCredentials as Partial<SslcommerzCredentials> | undefined;
    if (c?.storeId && c?.storePass) {
      return {
        storeId: c.storeId,
        storePass: c.storePass,
        sandbox: !!c.sandbox,
      };
    }
    return {
      storeId: paymentConfig.providers.sslcommerz.storeId,
      storePass: paymentConfig.providers.sslcommerz.storePassword,
      sandbox: paymentConfig.mode !== "live",
    };
  }

  private assertConfigured(): SslcommerzCredentials {
    const c = this.creds();
    if (!c.storeId || !c.storePass) {
      throw new Error("SSLCommerz credentials missing");
    }
    return c;
  }

  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const c = this.assertConfigured();
    const apiUrl = c.sandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

    const body = new URLSearchParams({
      store_id: c.storeId,
      store_passwd: c.storePass,
      total_amount: String(input.amount),
      currency: input.currency || "BDT",
      tran_id: input.paymentId,
      success_url: input.returnUrl,
      fail_url: input.cancelUrl,
      cancel_url: input.cancelUrl,
      cus_name: input.customerName,
      cus_email: input.customerEmail,
      cus_phone: input.customerPhone,
      product_name: "Event Ticket",
      product_category: "Ticket",
      product_profile: "general",
    });

    const res = await fetch(apiUrl, { method: "POST", body });
    const data = (await res.json()) as {
      status?: string;
      GatewayPageURL?: string;
      sessionkey?: string;
      failedreason?: string;
    };

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return {
        success: true,
        transactionId: data.sessionkey ?? input.paymentId,
        redirectUrl: data.GatewayPageURL,
        gatewayPayload: data as Record<string, unknown>,
      };
    }

    return {
      success: false,
      message: data.failedreason ?? "SSLCommerz session failed",
      gatewayPayload: data as Record<string, unknown>,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    this.assertConfigured();
    const valId = input.gatewayPayload?.val_id as string | undefined;
    if (!valId) {
      return {
        success: false,
        status: PaymentRecordStatus.Failed,
        failureReason: "Missing val_id from SSLCommerz callback",
      };
    }
    // TODO: call validation API with val_id
    return {
      success: true,
      status: PaymentRecordStatus.Paid,
      transactionId: input.transactionId ?? valId,
      verificationPayload: input.gatewayPayload,
    };
  }
}
