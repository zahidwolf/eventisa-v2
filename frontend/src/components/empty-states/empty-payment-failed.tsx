import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function EmptyPaymentFailed() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <AlertCircle className="h-14 w-14 text-accent-hot" />
      <h3 className="mt-6 font-display text-xl">Payment could not complete</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Your card was not charged. Try again or use demo payment in development.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={routes.checkout}>Retry checkout</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={routes.cart}>Back to cart</Link>
        </Button>
      </div>
    </div>
  );
}
