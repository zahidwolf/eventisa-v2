import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";
import { resolveTicketFromQr } from "@/modules/events/utils/checkin-qr.util.js";

async function assertEventAccess(userId: string, eventId: string) {
  const org = await Organizer.findOne({ userId });
  if (!org) throw new AppError("Organizer required", 403, ErrorCodes.FORBIDDEN);
  const event = await Event.findById(eventId);
  if (!event || event.organizer.toString() !== org._id.toString()) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }
  return event;
}

function mapStatus(status: TicketStatus) {
  if (status === TicketStatus.Used) return "checked-in";
  if (status === TicketStatus.Cancelled) return "cancelled";
  return "unused";
}

async function checkInTicket(ticketNumber: string, eventId: string, staffId: string) {
  const ticket = await Ticket.findOne({ ticketNumber, eventId });
  if (!ticket) throw new AppError("Ticket not found", 404, ErrorCodes.NOT_FOUND);
  if (ticket.status === TicketStatus.Cancelled) throw new AppError("Ticket cancelled", 400, ErrorCodes.VALIDATION_ERROR);
  if (ticket.status === TicketStatus.Used) throw new AppError("Already checked in", 409, ErrorCodes.CONFLICT);

  ticket.status = TicketStatus.Used;
  ticket.checkedInAt = new Date();
  ticket.checkedInBy = new mongoose.Types.ObjectId(staffId);
  await ticket.save();

  return {
    ticket: { ...ticket.toObject(), displayStatus: mapStatus(ticket.status) },
    message: "Check-in successful",
  };
}

export async function scanCheckIn(userId: string, qrData: string, eventId?: string) {
  let payload: { ticketNumber?: string; eventId?: string };
  try {
    payload = JSON.parse(qrData) as { ticketNumber?: string; eventId?: string };
  } catch {
    throw new AppError("Invalid QR", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const resolvedEventId = payload.eventId ?? eventId;
  if (!resolvedEventId) {
    throw new AppError("Invalid QR", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (eventId && payload.eventId && payload.eventId !== eventId) {
    throw new AppError("Wrong event", 400, ErrorCodes.VALIDATION_ERROR);
  }

  await assertEventAccess(userId, resolvedEventId);
  const event = await Event.findById(resolvedEventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  const resolved = await resolveTicketFromQr(qrData, event);
  if (!resolved) throw new AppError("Ticket not found", 404, ErrorCodes.NOT_FOUND);

  return checkInTicket(resolved.ticketId, resolvedEventId, userId);
}

export async function manualCheckIn(userId: string, ticketNumber: string, eventId: string) {
  await assertEventAccess(userId, eventId);
  return checkInTicket(ticketNumber, eventId, userId);
}

export async function getCheckInStats(userId: string, eventId: string) {
  await assertEventAccess(userId, eventId);
  const [total, checkedIn, unused, cancelled] = await Promise.all([
    Ticket.countDocuments({ eventId }),
    Ticket.countDocuments({ eventId, status: TicketStatus.Used }),
    Ticket.countDocuments({ eventId, status: TicketStatus.Active }),
    Ticket.countDocuments({ eventId, status: TicketStatus.Cancelled }),
  ]);
  return { total, checkedIn, unused, cancelled, attendanceRate: total ? checkedIn / total : 0 };
}
