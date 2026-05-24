import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import {
  CheckIn,
  CheckInRecordStatus,
} from "@/modules/events/models/checkIn.model.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { findSectionBySegmentRef } from "@/modules/events/utils/attendee-row.util.js";
import {
  buildCheckInFormAnswers,
  type CheckInFormAnswer,
} from "@/modules/events/utils/checkin-form-answers.util.js";
import { resolveTicketFromQr } from "@/modules/events/utils/checkin-qr.util.js";

export interface CheckInResultDto {
  status: CheckInRecordStatus;
  attendeeName: string;
  segmentName: string;
  segmentColor?: string;
  ticketId: string;
  scannedAt: string;
  firstScanAt?: string;
  message?: string;
  formAnswers?: CheckInFormAnswer[];
}

export type { CheckInFormAnswer };

export interface OfflineScanInput {
  qrPayload: string;
  deviceId?: string;
  scannedAt?: Date | string;
}

export interface CheckInTicketSearchRow {
  ticketNumber: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  segmentName: string;
  segmentColor?: string;
  orderId?: string;
  status: TicketStatus;
  checkedInAt?: string;
  canCheckIn: boolean;
  alreadyCheckedIn: boolean;
}

async function loadEventForAccess(eventId: string, userId: string, role: Role) {
  if (role === Role.Admin || role === Role.SuperAdmin) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    return event;
  }
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

function toResult(
  status: CheckInRecordStatus,
  resolved: {
    ticketId: string;
    attendeeName: string;
    segmentName: string;
    segmentColor?: string;
  },
  scannedAt: Date,
  firstScanAt?: Date,
  message?: string,
  formAnswers: CheckInFormAnswer[] = []
): CheckInResultDto {
  return {
    status,
    attendeeName: resolved.attendeeName,
    segmentName: resolved.segmentName,
    segmentColor: resolved.segmentColor,
    ticketId: resolved.ticketId,
    scannedAt: scannedAt.toISOString(),
    firstScanAt: firstScanAt?.toISOString(),
    message,
    formAnswers,
  };
}

export async function verifyTicket(qrPayload: string, eventId: string, userId: string, role: Role) {
  try {
    const event = await loadEventForAccess(eventId, userId, role);
    const resolved = await resolveTicketFromQr(qrPayload, event);
    if (!resolved) {
      return toResult(
        CheckInRecordStatus.NotFound,
        { ticketId: "", attendeeName: "—", segmentName: "—" },
        new Date(),
        undefined,
        "Ticket not found"
      );
    }
    const existing = await CheckIn.findOne({
      eventId: event._id,
      ticketId: resolved.ticketId,
      status: CheckInRecordStatus.Success,
    });
    if (existing || resolved.ticket?.status === TicketStatus.Used) {
      return toResult(
        CheckInRecordStatus.AlreadyCheckedIn,
        resolved,
        new Date(),
        existing?.scannedAt ?? resolved.ticket?.checkedInAt,
        "Already checked in"
      );
    }
    return toResult(CheckInRecordStatus.Success, resolved, new Date(), undefined, "Valid ticket");
  } catch (err) {
    if (err instanceof AppError) {
      return toResult(
        CheckInRecordStatus.Invalid,
        { ticketId: "", attendeeName: "—", segmentName: "—" },
        new Date(),
        undefined,
        err.message
      );
    }
    throw err;
  }
}

export async function checkInAttendee(
  ticketId: string,
  eventId: string,
  scannedBy: string,
  deviceId?: string,
  scannedAt = new Date()
) {
  try {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

    const ticket = await Ticket.findOne({ ticketNumber: ticketId, eventId: event._id });
    if (!ticket) {
      return toResult(
        CheckInRecordStatus.NotFound,
        { ticketId, attendeeName: "—", segmentName: "—" },
        scannedAt,
        undefined,
        "Ticket not found"
      );
    }

    const existing = await CheckIn.findOne({
      eventId: event._id,
      ticketId,
      status: CheckInRecordStatus.Success,
    });

    const section = findSectionBySegmentRef(event, ticket.sectionId);
    const segmentName = section?.name ?? section?.title ?? ticket.sectionTitle;
    const segmentColor = section?.ticketColor;
    const base = {
      ticketId,
      attendeeName: ticket.holderName,
      segmentName,
      segmentColor,
    };

    const formAnswers = await buildCheckInFormAnswers(event, ticket);

    if (existing || ticket.status === TicketStatus.Used) {
      await CheckIn.create({
        ticketId,
        orderId: ticket.orderId,
        eventId: event._id,
        segmentId: ticket.sectionId,
        userId: ticket.userId,
        scannedAt,
        scannedBy: new mongoose.Types.ObjectId(scannedBy),
        status: CheckInRecordStatus.AlreadyCheckedIn,
        deviceId,
        attendeeName: ticket.holderName,
      }).catch(() => undefined);

      return toResult(
        CheckInRecordStatus.AlreadyCheckedIn,
        base,
        scannedAt,
        existing?.scannedAt ?? ticket.checkedInAt,
        "Already checked in",
        formAnswers
      );
    }

    ticket.status = TicketStatus.Used;
    ticket.checkedInAt = scannedAt;
    ticket.checkedInBy = new mongoose.Types.ObjectId(scannedBy);
    await ticket.save();

    await CheckIn.create({
      ticketId,
      orderId: ticket.orderId,
      eventId: event._id,
      segmentId: ticket.sectionId,
      userId: ticket.userId,
      scannedAt,
      scannedBy: new mongoose.Types.ObjectId(scannedBy),
      status: CheckInRecordStatus.Success,
      deviceId,
      attendeeName: ticket.holderName,
    });

    return toResult(
      CheckInRecordStatus.Success,
      base,
      scannedAt,
      undefined,
      "Check-in successful",
      formAnswers
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Check-in failed", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function processScan(
  eventId: string,
  userId: string,
  role: Role,
  qrPayload: string,
  deviceId?: string,
  scannedAt = new Date()
): Promise<CheckInResultDto> {
  try {
    const event = await loadEventForAccess(eventId, userId, role);
    let resolved;
    try {
      resolved = await resolveTicketFromQr(qrPayload, event);
    } catch (err) {
      const msg = err instanceof AppError ? err.message : "Invalid ticket";
      return toResult(
        CheckInRecordStatus.Invalid,
        { ticketId: "", attendeeName: "—", segmentName: "—" },
        scannedAt,
        undefined,
        msg
      );
    }

    if (!resolved) {
      return toResult(
        CheckInRecordStatus.NotFound,
        { ticketId: "", attendeeName: "—", segmentName: "—" },
        scannedAt,
        undefined,
        "Ticket not found"
      );
    }

    return checkInAttendee(resolved.ticketId, eventId, userId, deviceId, scannedAt);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Scan failed", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

function segmentDisplay(event: InstanceType<typeof Event>, sectionId: string) {
  const section = findSectionBySegmentRef(event, sectionId);
  return {
    name: section?.name ?? section?.title ?? "Ticket",
    color: section?.ticketColor,
  };
}

export async function searchTicketsForCheckIn(
  eventId: string,
  userId: string,
  role: Role,
  query: string
): Promise<CheckInTicketSearchRow[]> {
  const event = await loadEventForAccess(eventId, userId, role);
  const q = query.trim();
  if (q.length < 2) return [];

  const eventOid = event._id as mongoose.Types.ObjectId;
  const ticketFilter: Record<string, unknown> = {
    eventId: eventOid,
    $or: [
      { ticketNumber: { $regex: q, $options: "i" } },
      { holderName: { $regex: q, $options: "i" } },
      { holderEmail: { $regex: q, $options: "i" } },
      { holderPhone: { $regex: q, $options: "i" } },
      { bookingId: { $regex: q, $options: "i" } },
    ],
  };

  const orderIdsFromQuery = await Order.find({
    eventId: eventOid,
    paymentStatus: PaymentStatus.Paid,
    $or: [
      { orderId: { $regex: q, $options: "i" } },
      { guestName: { $regex: q, $options: "i" } },
      { guestEmail: { $regex: q, $options: "i" } },
      { guestPhone: { $regex: q, $options: "i" } },
    ],
  })
    .select("_id orderId")
    .limit(20)
    .lean();

  const ticketsByText = await Ticket.find(ticketFilter).limit(25).lean();
  const ticketsByOrder =
    orderIdsFromQuery.length > 0
      ? await Ticket.find({
          eventId: eventOid,
          orderId: { $in: orderIdsFromQuery.map((o) => o._id) },
        })
          .limit(25)
          .lean()
      : [];

  const orderIdMap = new Map(orderIdsFromQuery.map((o) => [o._id.toString(), o.orderId]));
  const merged = new Map<string, (typeof ticketsByText)[0]>();
  for (const t of [...ticketsByText, ...ticketsByOrder]) {
    merged.set(t.ticketNumber, t);
  }

  const ticketList = [...merged.values()];
  const checkInTimes = await CheckIn.find({
    eventId: eventOid,
    ticketId: { $in: ticketList.map((t) => t.ticketNumber) },
    status: CheckInRecordStatus.Success,
  })
    .select("ticketId scannedAt")
    .lean();
  const checkedInAtByTicket = new Map(
    checkInTimes.map((c) => [c.ticketId, c.scannedAt])
  );

  return ticketList.map((t) => {
    const seg = segmentDisplay(event, t.sectionId);
    const checkedInAt =
      t.checkedInAt ?? checkedInAtByTicket.get(t.ticketNumber) ?? undefined;
    const isUsed = t.status === TicketStatus.Used;
    return {
      ticketNumber: t.ticketNumber,
      holderName: t.holderName,
      holderEmail: t.holderEmail,
      holderPhone: t.holderPhone,
      segmentName: seg.name,
      segmentColor: seg.color,
      orderId: orderIdMap.get(t.orderId.toString()),
      status: t.status as TicketStatus,
      checkedInAt: checkedInAt?.toISOString(),
      canCheckIn: t.status === TicketStatus.Active,
      alreadyCheckedIn: isUsed || !!checkedInAt,
    };
  });
}

export async function manualCheckIn(
  eventId: string,
  userId: string,
  role: Role,
  ticketNumber: string,
  deviceId?: string
): Promise<CheckInResultDto> {
  await loadEventForAccess(eventId, userId, role);
  return checkInAttendee(ticketNumber.trim(), eventId, userId, deviceId, new Date());
}

export async function bulkSyncOfflineScans(
  eventId: string,
  userId: string,
  role: Role,
  scans: OfflineScanInput[]
) {
  const results: CheckInResultDto[] = [];
  for (const scan of scans) {
    const at = scan.scannedAt ? new Date(scan.scannedAt) : new Date();
    const result = await processScan(eventId, userId, role, scan.qrPayload, scan.deviceId, at);
    results.push(result);
  }
  return results;
}

export { getCheckInStats, getCheckInLog } from "@/modules/events/services/checkIn-report.service.js";
