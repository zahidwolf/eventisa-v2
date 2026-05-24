"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Container } from "@/components/common/container";
import { useCheckoutStore } from "@/store/checkout.store";
import { simulateMockPayment } from "@/services/payments/payments.service";
import { routes } from "@/config/routes";
import { MOCK_SIMULATION_DELAY_MS } from "@/constants/payment";

function MockPaymentFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const paymentId = params.get("paymentId");
  const sessionId = useCheckoutStore((s) => s.sessionId);
  const orderId = useCheckoutStore((s) => s.orderId);
  const [status, setStatus] = useState("Processing demo payment…");

  useEffect(() => {
    if (!paymentId) return;

    const timer = setTimeout(async () => {
      try {
        const result = await simulateMockPayment({
          paymentId,
          sessionId,
          outcome: "success",
        });
        if (result.success) {
          router.replace(
            `${routes.checkoutSuccess}?orderId=${orderId ?? result.data?.orderId ?? ""}`
          );
        } else {
          router.replace(routes.checkoutFailed);
        }
      } catch {
        router.replace(routes.checkoutFailed);
      }
    }, MOCK_SIMULATION_DELAY_MS);

    return () => clearTimeout(timer);
  }, [paymentId, sessionId, orderId, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[50vh] flex-col items-center justify-center text-center"
    >
      <Loader2 className="h-12 w-12 animate-spin text-brand" />
      <p className="mt-6 text-lg font-medium">{status}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Simulating Bangladesh payment gateway ({MOCK_SIMULATION_DELAY_MS / 1000}s)
      </p>
    </motion.div>
  );
}

export default function MockPaymentPage() {
  return (
    <Container size="narrow">
      <Suspense fallback={<p className="py-20 text-center">Loading…</p>}>
        <MockPaymentFlow />
      </Suspense>
    </Container>
  );
}
