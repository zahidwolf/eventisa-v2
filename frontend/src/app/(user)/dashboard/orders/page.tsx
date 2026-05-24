"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrderList } from "@/components/user/orders/OrderList";
import { OrderDetailDrawer } from "@/components/user/orders/OrderDetailDrawer";
import { fetchUserOrders } from "@/services/user/user-dashboard.service";
import { USER_ORDER_LIST_STALE_MS } from "@/lib/buyer-query";
import type { OrderFilter, UserOrderRow } from "@/types/user-dashboard";

export default function DashboardOrdersPage() {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserOrderRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["user-orders", filter, search, page],
    queryFn: () =>
      fetchUserOrders({
        status: filter,
        search: search || undefined,
        page,
        limit: 20,
      }),
    staleTime: USER_ORDER_LIST_STALE_MS,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Order History</h1>
      <p className="mt-2 text-sm text-zinc-500">All your purchases and payment details.</p>
      <div className="mt-8">
        <OrderList
          orders={data?.data ?? data?.orders ?? []}
          total={data?.total ?? 0}
          page={page}
          limit={data?.limit ?? 20}
          isLoading={isLoading}
          filter={filter}
          onFilterChange={(f) => {
            setFilter(f);
            setPage(1);
          }}
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          onPageChange={setPage}
          onView={setSelected}
        />
      </div>
      <OrderDetailDrawer orderId={selected?._id ?? null} onClose={() => setSelected(null)} />
    </div>
  );
}
