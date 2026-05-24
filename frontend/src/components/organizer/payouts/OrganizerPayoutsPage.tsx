"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";
import { PayoutSummaryCards } from "./PayoutSummaryCards";
import { PayoutableEventsList } from "./PayoutableEventsList";
import { PayoutHistoryTable } from "./PayoutHistoryTable";
import { RequestPayoutModal } from "./RequestPayoutModal";
import {
  getPayoutSummary,
  getPayoutableEvents,
} from "@/services/organizer/payout.service";
import {
  fetchOrganizerSettings,
  isOrganizerBankingConfigured,
} from "@/services/organizer/settings.service";
import { ORGANIZER_DASHBOARD_STALE_MS, ORGANIZER_SETTINGS_STALE_MS } from "@/lib/organizer-query";
import type { PayoutStatus } from "@/types/payout.types";
import type { BankingSnapshot } from "@/types/payout.types";

type Tab = "request" | "history";
type HistoryFilter = PayoutStatus | "all";

const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "rejected", label: "Rejected" },
];

export function OrganizerPayoutsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("request");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEventIds, setModalEventIds] = useState<string[]>([]);

  const summaryQ = useQuery({
    queryKey: ["payout-summary"],
    queryFn: getPayoutSummary,
    staleTime: ORGANIZER_DASHBOARD_STALE_MS,
  });
  const eventsQ = useQuery({ queryKey: ["payoutable-events"], queryFn: getPayoutableEvents });
  const settingsQ = useQuery({
    queryKey: ["organizer-settings"],
    queryFn: fetchOrganizerSettings,
    staleTime: ORGANIZER_SETTINGS_STALE_MS,
  });

  const banking = settingsQ.data?.banking;
  const bankingConfigured = banking ? isOrganizerBankingConfigured(banking) : false;
  const bankingVerified = Boolean(banking?.bankingVerified);

  const openRequest = (ids?: string[]) => {
    if (ids?.length) setModalEventIds(ids);
    else setModalEventIds([]);
    setModalOpen(true);
  };

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["payout-summary"] });
    void qc.invalidateQueries({ queryKey: ["payoutable-events"] });
    void qc.invalidateQueries({ queryKey: ["organizer-payouts"] });
    setTab("history");
  };

  return (
    <Container className="py-8">
      <h1 className="font-display text-3xl font-bold text-white">Payouts & Earnings</h1>
      <p className="mt-1 text-sm text-zinc-500">Request payouts and track your settlement history.</p>

      <div className="mt-8">
        {summaryQ.data && (
          <PayoutSummaryCards
            summary={summaryQ.data}
            bankingConfigured={bankingConfigured}
            bankingVerified={bankingVerified}
            onRequestPayout={() => setTab("request")}
          />
        )}
      </div>

      <div className="mt-8 flex gap-2 border-b border-white/10">
        {(["request", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition",
              tab === t
                ? "border-b-2 border-[#FF3EA5] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t === "request" ? "Request Payout" : "Payout History"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "request" && eventsQ.data && (
          <PayoutableEventsList
            events={eventsQ.data}
            onRequestPayout={(ids) => {
              if (ids.length) openRequest(ids);
            }}
          />
        )}
        {tab === "history" && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {HISTORY_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHistoryFilter(f.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition",
                    historyFilter === f.id
                      ? "bg-[#FF3EA5] text-white"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <PayoutHistoryTable statusFilter={historyFilter} />
          </>
        )}
      </div>

      {eventsQ.data && (
        <RequestPayoutModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          events={eventsQ.data}
          selectedIds={modalEventIds}
          bankingSnapshot={banking as BankingSnapshot | undefined}
          onSuccess={refresh}
        />
      )}
    </Container>
  );
}
