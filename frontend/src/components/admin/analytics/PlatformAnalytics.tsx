"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsOverview } from "@/components/admin/analytics/AnalyticsOverview";
import { BreakdownCharts } from "@/components/admin/analytics/BreakdownCharts";
import { DateRangeSelector } from "@/components/admin/analytics/DateRangeSelector";
import { OrderStatusChart } from "@/components/admin/analytics/OrderStatusChart";
import { RecentActivity } from "@/components/admin/analytics/RecentActivity";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { TicketsChart } from "@/components/admin/analytics/TicketsChart";
import { TopEventsTable } from "@/components/admin/analytics/TopEventsTable";
import { TopOrganizersTable } from "@/components/admin/analytics/TopOrganizersTable";
import { UserGrowthChart } from "@/components/admin/analytics/UserGrowthChart";
import * as analyticsApi from "@/services/admin/adminAnalytics.service";
import type { AnalyticsDays } from "@/types/adminAnalytics.types";
import { ADMIN_ANALYTICS_STALE_MS } from "@/lib/admin-query";

export function PlatformAnalytics() {
  const [days, setDays] = useState<AnalyticsDays>(30);
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());

  const overviewQuery = useQuery({
    queryKey: ["admin-analytics-overview"],
    queryFn: analyticsApi.getOverview,
    staleTime: ADMIN_ANALYTICS_STALE_MS,
  });

  const seriesQueries = useQueries({
    queries: [
      {
        queryKey: ["admin-analytics-revenue", days],
        queryFn: () => analyticsApi.getRevenue(days),
      },
      {
        queryKey: ["admin-analytics-tickets", days],
        queryFn: () => analyticsApi.getTickets(days),
      },
      {
        queryKey: ["admin-analytics-users", days],
        queryFn: () => analyticsApi.getUsers(days),
      },
      {
        queryKey: ["admin-analytics-by-category"],
        queryFn: analyticsApi.getByCategory,
      },
      {
        queryKey: ["admin-analytics-by-city"],
        queryFn: analyticsApi.getByCity,
      },
      {
        queryKey: ["admin-analytics-order-status"],
        queryFn: analyticsApi.getOrderStatus,
      },
      {
        queryKey: ["admin-analytics-top-events"],
        queryFn: () => analyticsApi.getTopEvents(10),
      },
      {
        queryKey: ["admin-analytics-top-organizers"],
        queryFn: () => analyticsApi.getTopOrganizers(10),
      },
      {
        queryKey: ["admin-analytics-recent"],
        queryFn: analyticsApi.getRecent,
      },
    ],
  });

  const [
    revenueQ,
    ticketsQ,
    usersQ,
    categoryQ,
    cityQ,
    orderStatusQ,
    topEventsQ,
    topOrganizersQ,
    recentQ,
  ] = seriesQueries;

  const refetchAll = () => {
    setUpdatedAt(new Date());
    overviewQuery.refetch();
    seriesQueries.forEach((q) => q.refetch());
  };

  const minutesAgo = useMemo(() => {
    const m = Math.floor((Date.now() - updatedAt.getTime()) / 60000);
    if (m < 1) return "just now";
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }, [updatedAt, overviewQuery.dataUpdatedAt]);

  const overview = overviewQuery.data?.data;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Platform Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">Last updated: {minutesAgo}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeSelector value={days} onChange={setDays} />
          <Button type="button" variant="outline" size="sm" onClick={refetchAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {overviewQuery.isError && (
        <div className="glass-panel rounded-2xl p-6 text-center text-red-400">
          Could not load overview.{" "}
          <button type="button" className="underline" onClick={() => overviewQuery.refetch()}>
            Retry
          </button>
        </div>
      )}

      <AnalyticsOverview data={overview} loading={overviewQuery.isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart
          data={revenueQ.data?.data}
          loading={revenueQ.isLoading}
          error={revenueQ.isError}
          onRetry={() => revenueQ.refetch()}
        />
        <TicketsChart
          data={ticketsQ.data?.data}
          loading={ticketsQ.isLoading}
          error={ticketsQ.isError}
          onRetry={() => ticketsQ.refetch()}
        />
      </div>

      <UserGrowthChart
        data={usersQ.data?.data}
        loading={usersQ.isLoading}
        error={usersQ.isError}
        onRetry={() => usersQ.refetch()}
      />

      <BreakdownCharts
        categories={categoryQ.data?.data}
        cities={cityQ.data?.data}
        loading={categoryQ.isLoading || cityQ.isLoading}
        error={categoryQ.isError || cityQ.isError}
        onRetry={() => {
          categoryQ.refetch();
          cityQ.refetch();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <OrderStatusChart
          data={orderStatusQ.data?.data}
          loading={orderStatusQ.isLoading}
          error={orderStatusQ.isError}
          onRetry={() => orderStatusQ.refetch()}
        />
        <TopEventsTable data={topEventsQ.data?.data} loading={topEventsQ.isLoading} />
      </div>

      <TopOrganizersTable data={topOrganizersQ.data?.data} loading={topOrganizersQ.isLoading} />

      <RecentActivity data={recentQ.data?.data} loading={recentQ.isLoading} />
    </div>
  );
}
