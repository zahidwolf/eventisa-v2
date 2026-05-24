"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export default function PaymentFailedRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(routes.checkoutFailed);
  }, [router]);
  return null;
}
