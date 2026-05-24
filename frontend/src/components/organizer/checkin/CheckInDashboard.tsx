"use client";

import { useState } from "react";
import { BarChart3, Expand, List, QrCode, Shrink, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInResultOverlay } from "@/components/organizer/checkin/CheckInResult";
import { CheckInLogTable } from "@/components/organizer/checkin/CheckInLog";
import { CheckInStatsPanel } from "@/components/organizer/checkin/CheckInStats";
import { OfflineQueue } from "@/components/organizer/checkin/OfflineQueue";
import { ManualCheckIn } from "@/components/organizer/checkin/ManualCheckIn";
import { QRScanner } from "@/components/organizer/checkin/QRScanner";
import type { CheckInResult } from "@/types/checkIn.types";
import type { CheckInApiScope } from "@/services/checkIn.service";

type Tab = "scanner" | "manual" | "stats" | "log";

interface CheckInDashboardProps {
  eventId: string;
  eventTitle?: string;
  apiScope?: CheckInApiScope;
}

export function CheckInDashboard({ eventId, eventTitle, apiScope = "organizer" }: CheckInDashboardProps) {
  const [tab, setTab] = useState<Tab>("scanner");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const tabs: { id: Tab; label: string; icon: typeof QrCode }[] = [
    { id: "scanner", label: "Scanner", icon: QrCode },
    { id: "manual", label: "Manual", icon: UserCheck },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "log", label: "Log", icon: List },
  ];

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 flex flex-col bg-[#070B1A] p-4" : ""}>
      {eventTitle && !fullscreen && (
        <p className="mb-4 text-sm text-zinc-500">{eventTitle}</p>
      )}
      <div className="mb-4 flex gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                tab === t.id
                  ? "bg-accent-purple/30 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "scanner" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="min-h-12 min-w-12 border-white/15"
              onClick={() => setFullscreen((f) => !f)}
            >
              {fullscreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
            </Button>
          </div>
          <OfflineQueue eventId={eventId} apiScope={apiScope} />
          <QRScanner eventId={eventId} apiScope={apiScope} onResult={setResult} />
        </div>
      )}
      {tab === "manual" && (
        <ManualCheckIn eventId={eventId} apiScope={apiScope} onResult={setResult} />
      )}
      {tab === "stats" && <CheckInStatsPanel eventId={eventId} apiScope={apiScope} />}
      {tab === "log" && <CheckInLogTable eventId={eventId} apiScope={apiScope} />}

      <CheckInResultOverlay result={result} onDismiss={() => setResult(null)} />
    </div>
  );
}
