"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearPlatformCache,
  fetchSystemHealth,
} from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? "text-emerald-400" : "text-red-400"}>{ok ? "✅ Connected" : "❌ Error"}</span>
  );
}

export function SystemSettingsPanel() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: fetchSystemHealth,
  });

  const clearCache = useMutation({
    mutationFn: clearPlatformCache,
    onSuccess: () => {
      toast.success("Cache cleared");
      void refetch();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const refresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  if (isLoading || !data) {
    return <p className="text-sm text-zinc-500">Loading system health…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">Live service status</p>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching}
          onClick={() => void refresh()}
          className="border-white/10"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Database</p>
          <p className="mt-2 text-sm">
            <StatusBadge ok={data.database.status === "connected"} />
          </p>
          <p className="mt-1 text-xs text-zinc-500">Name: {data.database.databaseName}</p>
          <p className="text-xs text-zinc-500">Collections: {data.database.collectionsCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Email (SMTP)</p>
          <p className="mt-2 text-sm">
            <StatusBadge ok={data.email.status === "connected"} />
          </p>
          <p className="mt-1 text-xs text-zinc-500">{data.email.from ?? "Not configured"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Cloudinary</p>
          <p className="mt-2 text-sm text-zinc-400">
            {data.cloudinary.status === "configured" ? "✅ Configured" : "❌ Not set"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{data.cloudinary.cloudName ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Payment gateways</p>
          <p className="mt-2 text-sm text-zinc-300">{data.payments.activeCount} active</p>
          <p className="text-xs text-zinc-500">Default: {data.payments.defaultGateway ?? "—"}</p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-white">Database stats</p>
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
          {Object.entries(data.stats).map(([key, val]) => (
            <div key={key} className="rounded-lg border border-white/10 px-3 py-2">
              <p className="text-xs capitalize text-zinc-500">{key}</p>
              <p className="font-medium text-white">{val ?? "—"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="text-sm font-medium text-white">Cache</p>
        <p className="mt-1 text-xs text-zinc-500">
          Last cleared:{" "}
          {data.cacheLastClearedAt
            ? new Date(data.cacheLastClearedAt).toLocaleString()
            : "Never"}
          {lastRefresh && ` · Refreshed ${lastRefresh.toLocaleTimeString()}`}
        </p>
        <Button
          className="mt-3 bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
          size="sm"
          disabled={clearCache.isPending}
          onClick={() => clearCache.mutate()}
        >
          Clear cache
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 p-4 text-sm text-zinc-500">
        Error logs are written to the server console. View detailed logs in your deployment dashboard.
      </div>
    </div>
  );
}
