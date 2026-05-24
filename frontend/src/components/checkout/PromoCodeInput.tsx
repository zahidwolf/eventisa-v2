"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePromoCode } from "@/services/eventBuilder.service";
import { getApiErrorMessage } from "@/services/api/client";
import { useCheckoutStore } from "@/store/checkout.store";

interface PromoCodeInputProps {
  eventId: string;
  segmentId: string;
  quantity: number;
  originalPrice: number;
  onApply: (code: string, discountAmount: number, finalPrice: number) => void;
  onRemove: () => void;
}

export function PromoCodeInput({
  eventId,
  segmentId,
  quantity,
  originalPrice,
  onApply,
  onRemove,
}: PromoCodeInputProps) {
  const guestEmail = useCheckoutStore((s) => s.guest.email);
  const appliedCode = useCheckoutStore((s) => s.promoCode);
  const discount = useCheckoutStore((s) => s.promoDiscount);
  const finalTotal = useCheckoutStore((s) => s.promoFinalTotal);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    const code = input.trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const result = await validatePromoCode(
        eventId,
        code,
        segmentId,
        quantity,
        guestEmail || undefined
      );
      if (!result.valid) {
        setError(result.message ?? "Invalid promo code");
        return;
      }
      onApply(result.code ?? code.toUpperCase(), result.discountAmount, result.finalPrice);
      setInput("");
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-emerald-300">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Code applied</span>
        </div>
        <p className="mt-1 font-mono text-sm">{appliedCode}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Discount: ৳{discount.toLocaleString()}
          {finalTotal != null && (
            <>
              {" "}
              · New total: ৳{finalTotal.toLocaleString()}
            </>
          )}
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onRemove}>
          <X className="mr-1 h-3 w-3" />
          Remove
        </Button>
      </div>
    );
  }

  if (originalPrice <= 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Promo code</p>
      <div className="flex gap-2">
        <Input
          placeholder="Enter code"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <Button type="button" variant="secondary" onClick={handleApply} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
