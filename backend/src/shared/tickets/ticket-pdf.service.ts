import PDFDocument from "pdfkit";
import type { EventDocument } from "@/modules/events/models/event.model.js";
import type { OrderDocument } from "@/modules/orders/models/order.model.js";
import type { TicketDocument } from "@/modules/tickets/models/ticket.model.js";
import {
  eventVenueLabel,
  formatEventDate,
  formatEventTime,
  shortOrderId,
} from "@/shared/email/emailTriggers.helpers.js";

function qrBufferFromDataUrl(dataUrl: string): Buffer | null {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

function writeTicketPage(
  doc: PDFKit.PDFDocument,
  event: EventDocument,
  order: OrderDocument,
  ticket: TicketDocument
) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  doc.font("Helvetica-Bold").fontSize(20).fillColor("#FF3EA5").text("Eventisa", left, 48, {
    width: pageWidth,
    align: "center",
  });

  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111111").text(event.title, {
    width: pageWidth,
    align: "center",
  });

  doc.moveDown(0.8);
  doc.font("Helvetica").fontSize(11).fillColor("#333333");
  doc.text(`Date: ${formatEventDate(event.startDate)}`, { align: "center" });
  doc.text(`Time: ${formatEventTime(event.startDate)}`, { align: "center" });
  doc.text(`Venue: ${eventVenueLabel(event.venue)}`, { align: "center" });
  doc.text(`Ticket: ${ticket.sectionTitle}`, { align: "center" });
  doc.text(`Guest: ${ticket.holderName}`, { align: "center" });

  doc.moveDown(1);
  const qr = qrBufferFromDataUrl(ticket.qrCodeData);
  if (qr) {
    const qrSize = 180;
    const x = doc.page.margins.left + (pageWidth - qrSize) / 2;
    doc.image(qr, x, doc.y, { width: qrSize, height: qrSize });
    doc.y += qrSize + 12;
  }

  doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111").text(ticket.ticketNumber, {
    align: "center",
  });
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(10).fillColor("#666666").text(
    `Order #${shortOrderId(order)} · Show this QR code at entry`,
    { align: "center" }
  );
}

export async function generateOrderTicketsPdf(
  order: OrderDocument,
  event: EventDocument,
  tickets: TicketDocument[]
): Promise<Buffer> {
  if (!tickets.length) {
    throw new Error("No tickets to render");
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, autoFirstPage: false });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    tickets.forEach((ticket, index) => {
      doc.addPage();
      writeTicketPage(doc, event, order, ticket);
      if (index < tickets.length - 1) {
        doc.moveDown(0);
      }
    });

    doc.end();
  });
}

export function ticketPdfFilename(order: OrderDocument, eventTitle: string): string {
  const safeTitle = eventTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 40);
  return `Eventisa-Tickets-${safeTitle || shortOrderId(order)}.pdf`;
}
