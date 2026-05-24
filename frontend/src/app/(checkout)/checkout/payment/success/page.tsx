"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";

/** Redirect alias for provider return URLs */
export default function PaymentSuccessRedirectPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const orderId = params.get("orderId");
    router.replace(orderId ? `${routes.checkoutSuccess}?orderId=${orderId}` : routes.checkoutSuccess);
  }, [params, router]);

  return null;
}
