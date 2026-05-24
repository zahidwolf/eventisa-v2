"use client";

import { useState } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAttendees } from "@/services/eventBuilder.service";
import type { ExportFormat } from "@/types/attendee.types";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "sonner";

interface AttendeeExportProps {
  eventId: string;
  segmentId?: string;
  selectedIds?: string[];
  rowsForCsv?: {
    id: string;
    orderId: string;
    name: string;
    email: string;
    segmentName: string;
    submittedAt: string;
  }[];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function selectedToCsv(
  rows: NonNullable<AttendeeExportProps["rowsForCsv"]>
): string {
  const header = ["orderId", "name", "email", "segment", "submittedAt"];
  const lines = rows.map((r) =>
    [r.orderId, r.name, r.email, r.segmentName, r.submittedAt]
      .map((v) => (v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v))
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function AttendeeExport({
  eventId,
  segmentId,
  selectedIds = [],
  rowsForCsv = [],
}: AttendeeExportProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const runExport = async (format: ExportFormat) => {
    if (selectedIds.length && rowsForCsv.length) {
      const filtered = rowsForCsv.filter((r) => selectedIds.includes(r.id));
      const csv = selectedToCsv(filtered);
      downloadBlob(new Blob([csv], { type: "text/csv" }), `attendees-selected.csv`);
      setOpen(false);
      return;
    }

    setLoading(format);
    try {
      const blob = await exportAttendees(eventId, format, segmentId);
      const ext = format === "excel" ? "xlsx" : "csv";
      downloadBlob(blob, `attendees-${eventId}.${ext}`);
      setOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="border-white/15 gap-2"
        onClick={() => setOpen((o) => !o)}
        disabled={!!loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
        <ChevronDown className="h-4 w-4 opacity-60" />
      </Button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 min-w-[140px] rounded-lg border border-white/10 bg-[#12121e] py-1 shadow-xl">
            <button
              type="button"
              className="flex w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
              onClick={() => runExport("csv")}
            >
              {loading === "csv" ? "Exporting…" : "CSV"}
            </button>
            <button
              type="button"
              className="flex w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
              onClick={() => runExport("excel")}
            >
              {loading === "excel" ? "Exporting…" : "Excel"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
