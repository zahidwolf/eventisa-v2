"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "@/services/admin/admin-platform.service";

export default function AdminRefundsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders-refunds"],
    queryFn: () => fetchAdminOrders({ status: "refunded" }),
  });

  const orders = data?.data.orders ?? [];

  return (
    <div>
      <p className="mb-6 text-sm text-zinc-500">Refund requests and completed refunds.</p>
      {isLoading && <p className="text-zinc-500">Loading…</p>}
      {!orders.length && !isLoading && <p className="text-zinc-500">No refund orders</p>}
      <div className="space-y-2">
        {orders.map((o) => (
          <div key={String(o._id)} className="glass-panel rounded-xl p-4 text-sm">
            <span className="font-mono text-zinc-400">{String(o.orderId)}</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-white">{String(o.guestName)}</span>
            <span className="ml-2 text-[#FF3EA5]">৳{Number(o.total).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
