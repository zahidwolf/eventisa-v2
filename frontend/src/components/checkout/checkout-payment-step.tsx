"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking/metaPixel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { PaymentTrustBadges } from "@/components/checkout/payment-trust-badges";
import { useCheckoutStore } from "@/store/checkout.store";
import {
  fetchEventGatewayInfo,
  fetchPaymentConfigForEvent,
  initializePayment,
  simulateMockPayment,
} from "@/services/payments/payments.service";
import { completeCheckout } from "@/services/checkout/checkout.service";
import { getApiErrorMessage } from "@/services/api/client";
import { routes } from "@/config/routes";
import { MOCK_SIMULATION_DELAY_MS } from "@/constants/payment";

interface CheckoutPaymentStepProps {
  orderId: string;
  eventId: string;
  totalAmount: number;
}

export function CheckoutPaymentStep({ orderId, eventId, totalAmount }: CheckoutPaymentStepProps) {
  const router = useRouter();
  const sessionId = useCheckoutStore((s) => s.sessionId);
  const setStep = useCheckoutStore((s) => s.setStep);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const { data: configData, isLoading } = useQuery({
    queryKey: ["payment-config", eventId],
    queryFn: () => fetchPaymentConfigForEvent(eventId),
  });

  const { data: gatewayInfo } = useQuery({
    queryKey: ["gateway-info", eventId],
    queryFn: () => fetchEventGatewayInfo(eventId),
  });

  const config = configData?.data;
  const mockDelay = config?.mockDelayMs ?? MOCK_SIMULATION_DELAY_MS;

  useEffect(() => {
    trackEvent("AddPaymentInfo", {
      content_ids: [eventId],
      currency: "BDT",
      value: totalAmount,
    });
  }, [eventId, totalAmount]);

  const enabledMethods = config?.methods.filter((m) => m.enabled && !m.comingSoon) ?? [];
  const defaultMethod =
    enabledMethods[0]?.id ?? config?.methods.find((m) => m.id === "mock")?.id ?? null;

  useEffect(() => {
    if (selectedMethod === null && defaultMethod) {
      setSelectedMethod(defaultMethod);
    }
  }, [defaultMethod, selectedMethod]);

  const handleDemoPayment = async () => {
    if (!selectedMethod) {
      toast.error("Select a payment method");
      return;
    }

    setProcessing(true);
    try {
      if (selectedMethod === "mock" && config?.mode === "mock") {
        const init = await initializePayment({
          orderId,
          sessionId,
          method: "mock",
        });

        const paymentId = init.data!.paymentId;
        toast.message("Processing demo payment…", { duration: mockDelay });

        await new Promise((r) => setTimeout(r, mockDelay));

        const result = await simulateMockPayment({
          paymentId: paymentId!,
          sessionId,
          outcome: "success",
        });

        if (result.data?.success) {
          setStep(4);
          router.push(`${routes.checkoutSuccess}?orderId=${orderId}`);
          return;
        }
      }

      const init = await initializePayment({
        orderId,
        sessionId,
        method: selectedMethod,
      });

      if (init.data?.paymentUrl ?? init.data?.redirectUrl) {
        window.location.href = (init.data.paymentUrl ?? init.data.redirectUrl)!;
        return;
      }

      // Legacy fallback if mock path unavailable
      await completeCheckout({ orderId, sessionId, paymentMethod: selectedMethod });
      setStep(4);
      router.push(`${routes.checkoutSuccess}?orderId=${orderId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      router.push(routes.checkoutFailed);
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Choose payment method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {gatewayInfo && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              {gatewayInfo.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gatewayInfo.logo} alt="" className="h-10 w-10 rounded object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-sm font-bold text-brand">
                  {gatewayInfo.displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">You will pay via</p>
                <p className="font-semibold">{gatewayInfo.displayName}</p>
              </div>
            </div>
          )}
          {config && (
            <PaymentMethodSelector
              methods={config.methods}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
          )}
          <PaymentTrustBadges />
          <Button
            className="w-full"
            size="lg"
            disabled={processing || !selectedMethod}
            onClick={handleDemoPayment}
          >
            {processing
              ? "Processing…"
              : config?.mode === "mock"
                ? "Demo Payment"
                : "Pay now"}
          </Button>
          {config?.mode === "mock" && (
            <p className="text-center text-xs text-muted-foreground">
              Simulates a {mockDelay / 1000}s gateway delay — no real charge
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
