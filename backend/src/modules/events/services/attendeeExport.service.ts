import ExcelJS from "exceljs";
import type { AttendeeSubmissionRow } from "@/modules/events/utils/attendee-row.util.js";

function escapeCsv(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function collectFieldKeys(rows: AttendeeSubmissionRow[]) {
  const keys = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r.answers)) keys.add(k);
  }
  return [...keys].sort();
}

export function rowsToCSV(rows: AttendeeSubmissionRow[]): string {
  const dynamicCols = collectFieldKeys(rows);
  const header = [
    "orderId",
    "name",
    "email",
    "phone",
    "segmentId",
    "segmentName",
    ...dynamicCols,
    "submittedAt",
  ];
  const lines = [header.join(",")];

  for (const r of rows) {
    const dynamic = dynamicCols.map((k) => escapeCsv(String(r.answers[k] ?? "")));
    lines.push(
      [
        r.orderId,
        escapeCsv(r.name),
        escapeCsv(r.email),
        escapeCsv(r.phone ?? ""),
        r.segmentId,
        escapeCsv(r.segmentName),
        ...dynamic,
        r.submittedAt.toISOString(),
      ].join(",")
    );
  }
  return lines.join("\n");
}

export async function rowsToExcelBuffer(rows: AttendeeSubmissionRow[]): Promise<Buffer> {
  const dynamicCols = collectFieldKeys(rows);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendees");

  sheet.addRow([
    "Order ID",
    "Name",
    "Email",
    "Phone",
    "Segment ID",
    "Segment",
    ...dynamicCols,
    "Submitted At",
  ]);

  for (const r of rows) {
    sheet.addRow([
      r.orderId,
      r.name,
      r.email,
      r.phone ?? "",
      r.segmentId,
      r.segmentName,
      ...dynamicCols.map((k) => r.answers[k] ?? ""),
      r.submittedAt,
    ]);
  }

  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
