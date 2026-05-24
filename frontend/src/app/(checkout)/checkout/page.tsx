"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Container } from "@/components/common/container";
import { StepProgress } from "@/components/checkout/step-progress";
import { OrderSummary } from "@/components/checkout/order-summary";
import { GuestForm } from "@/components/checkout/guest-form";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";
import { CheckoutCustomForm } from "@/components/checkout/checkout-custom-form";
import { CheckoutFreeStep } from "@/components/checkout/checkout-free-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckoutStore } from "@/store/checkout.store";
import { PromoCodeInput } from "@/components/checkout/PromoCodeInput";
import { createOrder } from "@/services/orders/orders.service";
import { getStoredUtmParams } from "@/lib/tracking/utmTracker";
import { getApiErrorMessage } from "@/services/api/client";
import { routes } from "@/config/routes";
import type { GuestCheckoutForm } from "@/lib/validators/checkout.schema";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const reservationId = useCheckoutStore((s) => s.reservationId);
  const item = useCheckoutStore((s) => s.item);
  const orderId = useCheckoutStore((s) => s.orderId);
  const sessionId = useCheckoutStore((s) => s.sessionId);
  const customFormResponses = useCheckoutStore((s) => s.customFormResponses);
  const setCustomFormResponses = useCheckoutStore((s) => s.setCustomFormResponses);
  const setStep = useCheckoutStore((s) => s.setStep);
  const setGuest = useCheckoutStore((s) => s.setGuest);
  const setOrderId = useCheckoutStore((s) => s.setOrderId);
  const promoCode = useCheckoutStore((s) => s.promoCode);
  const promoDiscount = useCheckoutStore((s) => s.promoDiscount);
  const promoFinalTotal = useCheckoutStore((s) => s.promoFinalTotal);
  const setPromo = useCheckoutStore((s) => s.setPromo);
  const clearPromo = useCheckoutStore((s) => s.clearPromo);
  const [requiresPayment, setRequiresPayment] = useState(true);

  if (!reservationId || !item) {
    return (
      <Container className="py-20 text-center">
        <p>No active reservation.</p>
        <Button className="mt-4" onClick={() => router.push(routes.events)}>
          Browse events
        </Button>
      </Container>
    );
  }

  const handleGuestSubmit = async (data: GuestCheckoutForm) => {
    setGuest(data);
    setLoading(true);
    try {
      const utm = getStoredUtmParams();
      const res = await createOrder({
        reservationId,
        sessionId,
        guest: data,
        customFormResponses,
        coupon: promoCode ?? undefined,
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
      });
      setOrderId(res.data!.orderId);
      setRequiresPayment(res.data!.totalAmount > 0);
      setStep(3);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const progressStep = orderId ? 3 : 2;

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-5xl">
        <StepProgress current={progressStep} />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {!orderId && (
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Attendee information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <GuestForm onSubmit={handleGuestSubmit} loading={loading} />
                  <PromoCodeInput
                    eventId={item.eventId}
                    segmentId={item.sectionId}
                    quantity={item.quantity}
                    originalPrice={item.unitPrice}
                    onApply={(code, discountAmount, finalPrice) =>
                      setPromo(code, discountAmount, finalPrice)
                    }
                    onRemove={clearPromo}
                  />
                  <CheckoutCustomForm onValuesChange={setCustomFormResponses} />
                  <Button type="submit" form="guest-form" className="mt-2 w-full" disabled={loading}>
                    {item && item.unitPrice === 0 ? "Get Free Ticket" : "Continue to payment"}
                  </Button>
                </CardContent>
              </Card>
            )}
            {orderId &&
              (requiresPayment ? (
                <CheckoutPaymentStep
                  orderId={orderId}
                  eventId={item.eventId}
                  totalAmount={
                    promoFinalTotal ??
                    Math.max(
                      0,
                      item.unitPrice * item.quantity +
                        Math.round(item.unitPrice * item.quantity * 0.05) -
                        (promoDiscount ?? 0)
                    )
                  }
                />
              ) : (
                <CheckoutFreeStep orderId={orderId} />
              ))}
          </div>
          <OrderSummary />
        </div>
      </motion.div>
    </Container>
  );
}
