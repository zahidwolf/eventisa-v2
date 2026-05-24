"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bulkSyncScans, type CheckInApiScope } from "@/services/checkIn.service";
import { getApiErrorMessage } from "@/services/api/client";
import {
  clearQueue,
  getDeviceId,
  getLastSyncTime,
  readQueue,
  setLastSyncTime,
} from "@/components/organizer/checkin/checkin-queue.util";

interface OfflineQueueProps {
  eventId: string;
  apiScope?: CheckInApiScope;
  onSynced?: () => void;
}

export function OfflineQueue({ eventId, apiScope = "organizer", onSynced }: OfflineQueueProps) {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  const refresh = useCallback(() => {
    setPending(readQueue(eventId).length);
    setLastSync(getLastSyncTime(eventId));
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
  }, [eventId]);

  const sync = useCallback(async () => {
    const scans = readQueue(eventId);
    if (!scans.length) return;
    setSyncing(true);
    try {
      await bulkSyncScans(eventId, scans, apiScope);
      clearQueue(eventId);
      setLastSyncTime(eventId);
      toast.success(`Synced ${scans.length} scan(s)`);
      refresh();
      onSynced?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSyncing(false);
    }
  }, [eventId, onSynced, refresh]);

  useEffect(() => {
    refresh();
    const onOnline = () => {
      refresh();
      if (readQueue(eventId).length) void sync();
    };
    window.addEventListener("online", onOnline);
    const id = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(id);
    };
  }, [eventId, refresh, sync]);

  if (!pending && online) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <CloudOff className="h-5 w-5 text-amber-400" />
      <div className="min-w-0 flex-1 text-sm">
        {pending > 0 ? (
          <p className="font-medium text-amber-200">{pending} scan(s) pending sync</p>
        ) : (
          <p className="text-zinc-400">Queue empty</p>
        )}
        {lastSync && (
          <p className="text-xs text-zinc-500">Last sync: {new Date(lastSync).toLocaleString()}</p>
        )}
        {!online && <p className="text-xs text-amber-300/80">Offline — scans will sync when online</p>}
      </div>
      <Button
        type="button"
        size="sm"
        className="min-h-12 min-w-[120px] gap-2"
        disabled={!pending || syncing || !online}
        onClick={() => void sync()}
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        Sync now
      </Button>
    </div>
  );
}

export { getDeviceId };
