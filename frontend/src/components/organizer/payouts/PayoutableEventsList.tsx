"use client";

import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/formatCurrency";
import type { PayoutableEvent } from "@/types/payout.types";

interface PayoutableEventsListProps {
  events: PayoutableEvent[];
  onRequestPayout: (selectedIds: string[]) => void;
}

export function PayoutableEventsList({ events, onRequestPayout }: PayoutableEventsListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totals = useMemo(() => {
    let gross = 0;
    let fee = 0;
    let net = 0;
    for (const e of events) {
      if (!selected.has(e.eventId)) continue;
      gross += e.grossRevenue;
      fee += e.platformFee;
      net += e.netRevenue;
    }
    return { gross, fee, net, count: selected.size };
  }, [events, selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!events.length) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.08] p-10 text-center">
        <p className="font-medium text-white">No events available for payout</p>
        <p className="mt-2 text-sm text-zinc-500">
          Events become available after they have started and have ticket sales.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Select events to include in your payout request</h2>
      <div className="space-y-3">
        {events.map((e) => (
          <label
            key={e.eventId}
            className="glass-panel flex cursor-pointer gap-4 rounded-xl border border-white/[0.08] p-4 transition hover:border-white/20"
          >
            <input
              type="checkbox"
              checked={selected.has(e.eventId)}
              onChange={() => toggle(e.eventId)}
              className="mt-1 h-4 w-4 rounded border-white/20 accent-[#FF3EA5]"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{e.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="h-3 w-3" />
                {new Date(e.startDate).toLocaleDateString()}
                {e.endDate ? ` — ${new Date(e.endDate).toLocaleDateString()}` : ""}
              </p>
              <div className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
                <span className="text-zinc-400">
                  Gross: <span className="text-white">{formatBDT(e.grossRevenue)}</span>
                </span>
                <span className="text-zinc-500">Fee: -{formatBDT(e.platformFee)}</span>
                <span className="text-[#FF3EA5]">
                  Your earnings: <strong>{formatBDT(e.netRevenue)}</strong>
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{e.ticketsSold} tickets sold</p>
            </div>
          </label>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1 text-sm">
            <p className="text-zinc-500">Selected: {totals.count} events</p>
            <p className="text-zinc-400">Total gross: {formatBDT(totals.gross)}</p>
            <p className="text-zinc-500">Platform fee: -{formatBDT(totals.fee)}</p>
            <p className="text-xl font-bold text-white">You receive: {formatBDT(totals.net)}</p>
          </div>
          <Button
            disabled={totals.count === 0}
            className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
            onClick={() => onRequestPayout([...selected])}
          >
            Request Payout
          </Button>
        </div>
      </div>
    </div>
  );
}
