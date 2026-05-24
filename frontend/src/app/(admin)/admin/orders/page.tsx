"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "@/services/admin/admin-platform.service";

export default function AdminOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchAdminOrders(),
  });

  const orders = data?.data.orders ?? [];

  return (
    <div>
      {isLoading && <p className="text-zinc-500">Loading…</p>}
      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs text-zinc-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={String(o._id)} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 font-mono text-xs">{String(o.orderId)}</td>
                <td className="px-4 py-3">{String(o.guestName)}</td>
                <td className="px-4 py-3">৳{Number(o.total).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{String(o.paymentStatus)}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(String(o.createdAt)).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
