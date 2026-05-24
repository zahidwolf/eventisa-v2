"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmFreeOrder } from "@/services/orders/orders.service";
import { getApiErrorMessage } from "@/services/api/client";
import { useCheckoutStore } from "@/store/checkout.store";
import { routes } from "@/config/routes";

interface CheckoutFreeStepProps {
  orderId: string;
}

export function CheckoutFreeStep({ orderId }: CheckoutFreeStepProps) {
  const router = useRouter();
  const sessionId = useCheckoutStore((s) => s.sessionId);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmFreeOrder(orderId, sessionId);
      toast.success("Your free tickets are confirmed!");
      router.push(`${routes.checkoutSuccess}?orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-panel border-accent-magenta/20">
      <CardHeader>
        <CardTitle>Free ticket confirmation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">
          No payment required. Confirm to generate your tickets immediately.
        </p>
        <Button className="w-full min-h-12 bg-accent-magenta hover:bg-accent-magenta/90" onClick={handleConfirm} disabled={loading}>
          {loading ? "Confirming..." : "Get Free Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
}
