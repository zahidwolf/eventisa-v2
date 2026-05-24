"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TicketList } from "@/components/user/tickets/TicketList";
import { TicketModal } from "@/components/user/tickets/TicketModal";
import { fetchUserTickets, fetchUserOrderDetail } from "@/services/user/user-dashboard.service";
import {
  USER_ORDER_DETAIL_STALE_MS,
  USER_TICKET_LIST_STALE_MS,
} from "@/lib/buyer-query";
import type { TicketFilter, UserOrderRow } from "@/types/user-dashboard";

export default function DashboardTicketsContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserOrderRow | null>(null);

  const orderIdParam = searchParams.get("orderId");

  const { data, isLoading } = useQuery({
    queryKey: ["user-tickets", filter, search, page],
    queryFn: () =>
      fetchUserTickets({ status: filter, search: search || undefined, page, limit: 20 }),
    staleTime: USER_TICKET_LIST_STALE_MS,
  });

  const orders = useMemo(() => data?.data ?? data?.orders ?? [], [data]);

  const needsDeepFetch =
    !!orderIdParam && !orders.some((o) => o._id === orderIdParam || o.orderId === orderIdParam);

  const { data: deepOrder } = useQuery({
    queryKey: ["user-order-for-ticket", orderIdParam],
    queryFn: () => fetchUserOrderDetail(orderIdParam!),
    enabled: needsDeepFetch && !isLoading,
    staleTime: USER_ORDER_DETAIL_STALE_MS,
  });

  useEffect(() => {
    if (!orderIdParam) return;
    const match = orders.find((o) => o._id === orderIdParam || o.orderId === orderIdParam);
    if (match) setSelected(match);
  }, [orderIdParam, orders]);

  useEffect(() => {
    if (deepOrder) setSelected(deepOrder);
  }, [deepOrder]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">My Tickets</h1>
      <p className="mt-2 text-sm text-zinc-500">View QR codes for your confirmed bookings.</p>
      <div className="mt-8">
        <TicketList
          orders={orders}
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
      <TicketModal order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
