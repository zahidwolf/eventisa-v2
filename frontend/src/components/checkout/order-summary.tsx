"use client";

import { useEffect, useState } from "react";
import { useCheckoutStore } from "@/store/checkout.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/config/env";
import { fetchPlatformStatus } from "@/services/public/platform.service";

interface OrderSummaryProps {
  serviceFee?: number;
  total?: number;
}

export function OrderSummary({ serviceFee, total }: OrderSummaryProps) {
  const item = useCheckoutStore((s) => s.item);
  const promoDiscount = useCheckoutStore((s) => s.promoDiscount);
  const promoFinalTotal = useCheckoutStore((s) => s.promoFinalTotal);
  const [feeRate, setFeeRate] = useState(0.05);

  useEffect(() => {
    fetchPlatformStatus()
      .then((s) => setFeeRate(s.serviceFeePercent / 100))
      .catch(() => setFeeRate(0.05));
  }, []);

  if (!item) {
    return (
      <Card className="glass-panel sticky top-24">
        <CardContent className="p-6 text-sm text-muted-foreground">No items selected</CardContent>
      </Card>
    );
  }

  const subtotal = item.unitPrice * item.quantity;
  const fee = serviceFee ?? Math.round(subtotal * feeRate);
  const gross = subtotal + fee;
  const discount = promoDiscount > 0 ? promoDiscount : 0;
  const grandTotal = total ?? (promoFinalTotal != null ? promoFinalTotal : gross - discount);

  return (
    <Card className="glass-panel sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-medium">{item.eventTitle}</p>
          <p className="text-muted-foreground">
            {item.sectionTitle} × {item.quantity}
          </p>
        </div>
        <div className="space-y-2 border-t border-surface-border pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>৳{fee.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Promo discount</span>
              <span>-৳{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-accent-gold">
              ৳{grandTotal.toLocaleString()} {env.currency}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
