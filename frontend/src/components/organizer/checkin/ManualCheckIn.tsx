"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  manualCheckIn,
  searchTicketsForCheckIn,
  type CheckInApiScope,
} from "@/services/checkIn.service";
import type { CheckInResult, CheckInTicketSearchRow } from "@/types/checkIn.types";

interface ManualCheckInProps {
  eventId: string;
  apiScope?: CheckInApiScope;
  onResult: (result: CheckInResult) => void;
}

export function ManualCheckIn({ eventId, apiScope = "organizer", onResult }: ManualCheckInProps) {
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<CheckInTicketSearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setTickets([]);
        return;
      }
      setSearching(true);
      try {
        const rows = await searchTicketsForCheckIn(eventId, trimmed, apiScope);
        setTickets(rows);
      } catch {
        toast.error("Search failed");
        setTickets([]);
      } finally {
        setSearching(false);
      }
    },
    [eventId, apiScope]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      void runSearch(query);
    }, 350);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  const formatCheckedInTime = (iso?: string) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleCheckIn = async (ticket: CheckInTicketSearchRow) => {
    setCheckingIn(ticket.ticketNumber);
    try {
      const result = await manualCheckIn(eventId, ticket.ticketNumber, apiScope);
      onResult(result);
      void runSearch(query);
    } catch {
      toast.error("Check-in failed");
    } finally {
      setCheckingIn(null);
    }
  };

  const isAlreadyCheckedIn = (ticket: CheckInTicketSearchRow) =>
    ticket.alreadyCheckedIn || !ticket.canCheckIn || !!ticket.checkedInAt;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, ticket #, or order ID"
          className="min-h-12 border-white/15 bg-white/5 pl-10 text-base text-white placeholder:text-zinc-500"
        />
      </div>

      {searching && (
        <div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Searching…
        </div>
      )}

      {!searching && query.trim().length >= 2 && tickets.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No tickets found</p>
      )}

      {!searching && query.trim().length < 2 && (
        <p className="py-8 text-center text-sm text-zinc-500">Type at least 2 characters to search</p>
      )}

      <ul className="space-y-3">
        {tickets.map((ticket) => {
          const checkedInLabel = formatCheckedInTime(ticket.checkedInAt);
          return (
          <li
            key={ticket.ticketNumber}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
            style={{ borderLeftWidth: 4, borderLeftColor: ticket.segmentColor ?? "#9B5CFF" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{ticket.holderName}</p>
                <p className="mt-1 truncate text-sm text-zinc-400">{ticket.holderEmail}</p>
                {ticket.holderPhone && (
                  <p className="text-sm text-zinc-500">{ticket.holderPhone}</p>
                )}
                <p className="mt-2 text-xs text-zinc-500">
                  {ticket.segmentName}
                  {ticket.orderId ? ` · ${ticket.orderId}` : ""}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600">{ticket.ticketNumber}</p>
              </div>
              {isAlreadyCheckedIn(ticket) ? (
                <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                  <p className="text-sm font-semibold text-amber-300">Already checked in</p>
                  {checkedInLabel && (
                    <p className="text-xs text-zinc-400">{checkedInLabel}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={checkingIn === ticket.ticketNumber}
                    className="min-h-10 border-white/15 text-xs"
                    onClick={() => void handleCheckIn(ticket)}
                  >
                    {checkingIn === ticket.ticketNumber ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "View details"
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  disabled={checkingIn === ticket.ticketNumber}
                  className="min-h-11 shrink-0 gap-2"
                  onClick={() => void handleCheckIn(ticket)}
                >
                  {checkingIn === ticket.ticketNumber ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  Check in
                </Button>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
