"use client";

import { GatewayList } from "@/components/admin/payments/GatewayList";

export default function AdminPaymentGatewaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Payment Gateways</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add SSLCommerz, bKash, or Nagad credentials and assign them to events.
        </p>
      </div>
      <GatewayList />
    </div>
  );
}
