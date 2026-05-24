"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AttendeeFormFieldLabel, AttendeeSubmission } from "@/types/attendee.types";

type SortKey = "name" | "email" | "phone" | "segmentName" | "submittedAt" | "orderId";

interface AttendeeTableProps {
  rows: AttendeeSubmission[];
  page: number;
  limit: number;
  total: number;
  loading?: boolean;
  showOrderIdColumn?: boolean;
  formFields?: AttendeeFormFieldLabel[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onRowClick: (row: AttendeeSubmission) => void;
}

const STANDARD_KEYS = new Set([
  "name",
  "full_name",
  "fullname",
  "guest_name",
  "guestname",
  "email",
  "e-mail",
  "guest_email",
  "guestemail",
  "phone",
  "mobile",
  "guest_phone",
  "guestphone",
]);

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button type="button" className="flex items-center gap-1 hover:text-white" onClick={onClick}>
      {label}
      {active && (dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
    </button>
  );
}

function formatCell(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function AttendeeTable({
  rows,
  page,
  limit,
  total,
  loading,
  showOrderIdColumn = false,
  formFields = [],
  selectedIds,
  onSelectIds,
  onPageChange,
  onRowClick,
}: AttendeeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const extraColumns = useMemo(
    () =>
      formFields.filter((f) => !STANDARD_KEYS.has(f.key.toLowerCase())),
    [formFields]
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let av: string;
      let bv: string;
      if (sortKey === "phone") {
        av = a.phone ?? "";
        bv = b.phone ?? "";
      } else if (extraColumns.some((c) => c.key === sortKey)) {
        av = formatCell(a.answers[sortKey]);
        bv = formatCell(b.answers[sortKey]);
      } else {
        av = String(a[sortKey as keyof AttendeeSubmission] ?? "");
        bv = String(b[sortKey as keyof AttendeeSubmission] ?? "");
      }
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir, extraColumns]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const colSpan = 6 + (showOrderIdColumn ? 1 : 0) + extraColumns.length;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-[#12121e] text-left text-zinc-400">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) =>
                    onSelectIds(e.target.checked ? rows.map((r) => r.id) : [])
                  }
                />
              </th>
              <th className="px-3 py-3">#</th>
              {showOrderIdColumn && (
                <th className="px-3 py-3">
                  <SortHeader
                    label="Order ID"
                    active={sortKey === "orderId"}
                    dir={sortDir}
                    onClick={() => toggleSort("orderId")}
                  />
                </th>
              )}
              <th className="px-3 py-3">
                <SortHeader label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Email" active={sortKey === "email"} dir={sortDir} onClick={() => toggleSort("email")} />
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Phone" active={sortKey === "phone"} dir={sortDir} onClick={() => toggleSort("phone")} />
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Segment" active={sortKey === "segmentName"} dir={sortDir} onClick={() => toggleSort("segmentName")} />
              </th>
              {extraColumns.map((col) => (
                <th key={col.key} className="min-w-[120px] px-3 py-3">
                  <SortHeader
                    label={col.label}
                    active={sortKey === col.key}
                    dir={sortDir}
                    onClick={() => toggleSort(col.key as SortKey)}
                  />
                </th>
              ))}
              <th className="px-3 py-3">
                <SortHeader label="Submitted" active={sortKey === "submittedAt"} dir={sortDir} onClick={() => toggleSort("submittedAt")} />
              </th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-10 text-center text-zinc-500">
                  Loading attendees…
                </td>
              </tr>
            ) : sorted.length ? (
              sorted.map((row, i) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-t border-white/5 hover:bg-white/5"
                  onClick={() => onRowClick(row)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => {
                        if (e.target.checked) onSelectIds([...selectedIds, row.id]);
                        else onSelectIds(selectedIds.filter((id) => id !== row.id));
                      }}
                    />
                  </td>
                  <td className="px-3 py-3 text-zinc-500">{(page - 1) * limit + i + 1}</td>
                  {showOrderIdColumn && (
                    <td className="px-3 py-3 font-mono text-xs text-zinc-400">{row.orderId}</td>
                  )}
                  <td className="px-3 py-3 font-medium text-white">{row.name}</td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-zinc-300" title={row.email}>
                    {row.email}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">{row.phone ?? "—"}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: row.segmentColor ?? "#9B5CFF" }}
                      />
                      {row.segmentName}
                    </span>
                  </td>
                  {extraColumns.map((col) => (
                    <td
                      key={col.key}
                      className="max-w-[180px] truncate px-3 py-3 text-zinc-300"
                      title={formatCell(row.answers[col.key])}
                    >
                      {formatCell(row.answers[col.key])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-3 text-zinc-400">
                    {new Date(row.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <Button type="button" size="sm" variant="ghost" className="text-accent-magenta">
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colSpan} className="px-4 py-10 text-center text-zinc-500">
                  No attendees match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0c1020] px-4 py-3 text-sm text-zinc-400">
        <span>
          {total} total · page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/15"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/15"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
