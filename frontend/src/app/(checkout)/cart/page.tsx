"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/common/container";
import { StepProgress } from "@/components/checkout/step-progress";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckoutStore } from "@/store/checkout.store";
import { trackEvent } from "@/lib/tracking/metaPixel";
import { reserveTickets } from "@/services/orders/orders.service";
import { getApiErrorMessage } from "@/services/api/client";
import { routes } from "@/config/routes";

function CartContent() {
  const router = useRouter();
  const params = useSearchParams();
  const item = useCheckoutStore((s) => s.item);
  const sessionId = useCheckoutStore((s) => s.sessionId);
  const setItem = useCheckoutStore((s) => s.setItem);
  const setStep = useCheckoutStore((s) => s.setStep);
  const setReservation = useCheckoutStore((s) => s.setReservation);

  useEffect(() => {
    const eventId = params.get("eventId");
    const sectionId = params.get("sectionId");
    if (!eventId || !sectionId) return;

    setItem({
      eventId,
      eventSlug: params.get("slug") ?? "",
      eventTitle: decodeURIComponent(params.get("title") ?? "Event"),
      sectionId,
      sectionTitle: decodeURIComponent(params.get("sectionTitle") ?? "Ticket"),
      unitPrice: Number(params.get("price") ?? 0),
      quantity: 1,
      coverImage: params.get("cover") ?? undefined,
    });
    setStep(1);
  }, [params, setItem, setStep]);

  const quantity = item?.quantity ?? 1;

  const handleReserve = async () => {
    if (!item) {
      toast.error("Select tickets from an event first");
      router.push(routes.events);
      return;
    }
    trackEvent("InitiateCheckout", {
      content_ids: [item.eventId],
      content_name: item.eventTitle,
      num_items: quantity,
      currency: "BDT",
      value: item.unitPrice * quantity,
    });
    try {
      const res = await reserveTickets({
        eventId: item.eventId,
        sectionId: item.sectionId,
        quantity,
        sessionId,
      });
      setReservation(res.data.reservationId, res.data.expiresAt, res.data.total);
      setStep(2);
      router.push(routes.checkout);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-5xl">
      <StepProgress current={1} />
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Ticket selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {item ? (
                <>
                  <p className="text-lg font-semibold">{item.eventTitle}</p>
                  <p className="text-muted-foreground">{item.sectionTitle}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setItem({ ...item, quantity: Math.max(1, quantity - 1) })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setItem({ ...item, quantity: Math.min(10, quantity + 1) })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="ml-auto text-accent-gold">
                      ৳{(item.unitPrice * quantity).toLocaleString()}
                    </span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleReserve}>
                    Reserve & continue — 10 min hold
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">Browse events to select tickets.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <OrderSummary />
      </div>
    </motion.div>
  );
}

export default function CartPage() {
  return (
    <Container>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CartContent />
      </Suspense>
    </Container>
  );
}
