"use client";

import { useCallback, useEffect, useState } from "react";
import { AttendeeDrawer } from "@/components/organizer/attendees/AttendeeDrawer";
import { AttendeeExport } from "@/components/organizer/attendees/AttendeeExport";
import { AttendeeFiltersBar } from "@/components/organizer/attendees/AttendeeFilters";
import { AttendeeTable } from "@/components/organizer/attendees/AttendeeTable";
import { useDebouncedValue } from "@/components/organizer/attendees/useDebouncedValue";
import { getAttendees } from "@/services/eventBuilder.service";
import { fetchAdminAttendees } from "@/services/admin/admin-event-detail.service";
import { getApiErrorMessage } from "@/services/api/client";
import type {
  AttendeeFilters,
  AttendeeFormFieldLabel,
  AttendeeSubmission,
  SegmentAttendeeCount,
} from "@/types/attendee.types";
import { toast } from "sonner";

const DEFAULT_FILTERS: AttendeeFilters = { page: 1, limit: 25 };

interface AttendeeDashboardProps {
  eventId: string;
  apiMode?: "organizer" | "admin";
  showOrderIdColumn?: boolean;
}

export function AttendeeDashboard({
  eventId,
  apiMode = "organizer",
  showOrderIdColumn = false,
}: AttendeeDashboardProps) {
  const [filters, setFilters] = useState<AttendeeFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search ?? "", 300);
  const [rows, setRows] = useState<AttendeeSubmission[]>([]);
  const [segmentCounts, setSegmentCounts] = useState<SegmentAttendeeCount[]>([]);
  const [formFields, setFormFields] = useState<AttendeeFormFieldLabel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher =
        apiMode === "admin"
          ? () =>
              fetchAdminAttendees(eventId, {
                ...filters,
                search: debouncedSearch || undefined,
              })
          : () =>
              getAttendees(eventId, {
                ...filters,
                search: debouncedSearch || undefined,
              });
      const data = await fetcher();
      setRows(
        data.rows.map((r) => ({
          ...r,
          submittedAt:
            typeof r.submittedAt === "string"
              ? r.submittedAt
              : new Date(r.submittedAt).toISOString(),
        }))
      );
      setTotal(data.total);
      setSegmentCounts(data.segmentCounts);
      setFormFields(data.formFields ?? []);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [eventId, filters, debouncedSearch, apiMode]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedIds([]);
  };

  const selectedRows = rows.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-gradient-to-r from-accent-purple/10 to-accent-magenta/10 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Total attendees</p>
          <p className="font-display text-2xl font-bold text-white">{total}</p>
        </div>
        {segmentCounts.map((s) => (
          <button
            key={s.segmentId}
            type="button"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                segmentId: f.segmentId === s.segmentId ? undefined : s.segmentId,
                page: 1,
              }))
            }
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
              filters.segmentId === s.segmentId
                ? "border-accent-magenta/50 bg-accent-magenta/15 text-white"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color ?? "#9B5CFF" }} />
            {s.name}
            <span className="text-zinc-500">{s.count}</span>
          </button>
        ))}
        <div className="ml-auto">
          <AttendeeExport
            eventId={eventId}
            segmentId={filters.segmentId}
            selectedIds={selectedIds}
            rowsForCsv={selectedRows.map((r) => ({
              id: r.id,
              orderId: r.orderId,
              name: r.name,
              email: r.email,
              segmentName: r.segmentName,
              submittedAt: r.submittedAt,
            }))}
          />
        </div>
      </div>

      <AttendeeFiltersBar
        filters={filters}
        segments={segmentCounts}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={resetFilters}
      />

      <AttendeeTable
        rows={rows}
        page={filters.page ?? 1}
        limit={filters.limit ?? 25}
        total={total}
        loading={loading}
        showOrderIdColumn={showOrderIdColumn}
        formFields={formFields}
        selectedIds={selectedIds}
        onSelectIds={setSelectedIds}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onRowClick={(row) => setDrawerId(row.id)}
      />

      <AttendeeDrawer
        eventId={eventId}
        submissionId={drawerId}
        apiMode={apiMode}
        fieldLabels={Object.fromEntries(formFields.map((f) => [f.key, f.label]))}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}
